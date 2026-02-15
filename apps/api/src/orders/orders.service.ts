import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Order, OrderStatus } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { Product } from "../products/product.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PurchasePolicy } from "../products/purchase-policy.enum";
import { ProductType } from "../products/product-type.enum";

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const { userId, items, idempotencyKey } = dto;
    if (!items?.length) {
      throw new BadRequestException("Order must contain at least one item");
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingOrder = await this.findExistingOrder(
        queryRunner,
        userId,
        idempotencyKey,
      );
      if (existingOrder) return existingOrder;

      const productsById = await this.loadProductsWithLocking(
        queryRunner,
        items,
      );

      await this.ensureOneTimePurchase(
        queryRunner,
        userId,
        items,
        productsById,
      );
      this.validateItems(items, productsById);

      const order = await this.createOrderEntity(
        queryRunner,
        userId,
        idempotencyKey,
      );
      await this.createOrderItems(queryRunner, items, productsById, order);

      await queryRunner.commitTransaction();
      return await queryRunner.manager.findOneOrFail(Order, {
        where: { id: order.id },
        relations: ["items"],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async findExistingOrder(
    queryRunner: any,
    userId: string,
    idempotencyKey?: string,
  ) {
    if (!idempotencyKey) return null;
    return queryRunner.manager.findOne(Order, {
      where: { userId, idempotencyKey },
      relations: ["items"],
    });
  }

  private async ensureOneTimePurchase(
    queryRunner: any,
    userId: string,
    items: CreateOrderDto["items"],
    productsById: Map<string, Product>,
  ) {
    for (const item of items) {
      const product = productsById.get(item.productId)!;
      if (product.purchasePolicy === PurchasePolicy.ONE_TIME) {
        const alreadyPurchased = await queryRunner.manager.exists(OrderItem, {
          where: {
            productId: product.id,
            order: { userId, status: OrderStatus.PAID },
          },
          relations: ["order"],
        });
        if (alreadyPurchased) {
          throw new ConflictException(
            `Product "${product.title}" can only be purchased once`,
          );
        }
      }
    }
  }

  private async loadProductsWithLocking(
    queryRunner: any,
    items: CreateOrderDto["items"],
  ): Promise<Map<string, Product>> {
    const productIds = [...new Set(items.map((i) => i.productId))];

    if (!productIds.length) {
      throw new BadRequestException("No products provided");
    }

    // First get product types to know what to lock
    const allProducts = await queryRunner.manager.find(Product, {
      where: { id: In(productIds) },
      select: ["id", "type"], // lightweight
    });

    if (allProducts.length !== productIds.length) {
      throw new BadRequestException("One or more products not found");
    }

    const physicalIds = allProducts
      .filter((p: Product) => p.type === ProductType.PHYSICAL)
      .map((p: Product) => p.id);

    const nonPhysicalIds = allProducts
      .filter((p: Product) => p.type !== ProductType.PHYSICAL)
      .map((p: Product) => p.id);

    const products: Product[] = [];

    // Lock physical immediately
    if (physicalIds.length) {
      const lockedPhysical = await queryRunner.manager.find(Product, {
        where: { id: In(physicalIds) },
        lock: { mode: "pessimistic_write" },
      });
      products.push(...lockedPhysical);
    }

    // Load the rest normally
    if (nonPhysicalIds.length) {
      const rest = await queryRunner.manager.find(Product, {
        where: { id: In(nonPhysicalIds) },
      });
      products.push(...rest);
    }

    return new Map(products.map((p) => [p.id, p]));
  }

  private validateItems(
    items: CreateOrderDto["items"],
    productsById: Map<string, Product>,
  ) {
    for (const item of items) {
      const product = productsById.get(item.productId)!;

      if (item.quantity <= 0) {
        throw new BadRequestException("Quantity must be greater than 0");
      }

      if (product.type === ProductType.PHYSICAL) {
        if (product.stock === null)
          throw new InternalServerErrorException(
            "Physical product without stock",
          );
        if (product.stock < item.quantity)
          throw new ConflictException(
            `Insufficient stock for product "${product.title}"`,
          );
      }

      if (product.type === ProductType.DONATION) {
        if (!item.priceAtPurchase || Number(item.priceAtPurchase) < 1) {
          throw new BadRequestException("Minimum donation amount is 1");
        }
      }
    }
  }

  private async createOrderEntity(
    queryRunner: any,
    userId: string,
    idempotencyKey?: string,
  ) {
    const order = queryRunner.manager.create(Order, {
      userId,
      idempotencyKey,
      status: OrderStatus.CREATED,
    });
    return queryRunner.manager.save(order);
  }

  private async createOrderItems(
    queryRunner: any,
    items: CreateOrderDto["items"],
    productsById: Map<string, Product>,
    order: Order,
  ) {
    const orderItems: OrderItem[] = [];
    for (const item of items) {
      const product = productsById.get(item.productId)!;
      const priceAtPurchase =
        product.type === ProductType.DONATION
          ? item.priceAtPurchase!
          : product.price!;
      const orderItem = queryRunner.manager.create(OrderItem, {
        orderId: order.id,
        productId: product.id,
        quantity: item.quantity,
        priceAtPurchase,
      });
      orderItems.push(orderItem);

      if (product.type === ProductType.PHYSICAL) {
        await queryRunner.manager.decrement(
          Product,
          { id: product.id },
          "stock",
          item.quantity,
        );
      }
    }
    await queryRunner.manager.save(orderItems);
  }

  async findById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: { user: true, items: { product: true } },
    });
  }

  async listOrders(userId: string | undefined): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: { user: true, items: { product: true } },
      order: { createdAt: "DESC" },
      where: userId ? { userId } : {},
    });
  }
}
