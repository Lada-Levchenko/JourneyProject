import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, In, Repository } from "typeorm";
import { Order } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { Product } from "../products/product.entity";
import { User } from "../users/user.entity";

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createOrder(
    userId: string,
    items: CreateOrderItemInput[],
  ): Promise<Order> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const productIds = items.map((item) => item.productId);
    const uniqueProductIds = [...new Set(productIds)];
    const products = await this.productsRepository.find({
      where: { id: In(uniqueProductIds) },
    });

    if (products.length !== uniqueProductIds.length) {
      throw new Error("One or more products were not found");
    }

    const productsById = new Map(
      products.map((product) => [product.id, product]),
    );

    return this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const orderItemRepository = manager.getRepository(OrderItem);

      const order = orderRepository.create({ userId: user.id, user });
      await orderRepository.save(order);

      const orderItems = items.map((item) => {
        const product = productsById.get(item.productId);
        if (!product) {
          throw new Error("Product not found");
        }

        return orderItemRepository.create({
          orderId: order.id,
          order,
          productId: product.id,
          product,
          quantity: item.quantity,
          priceAtPurchase: product.price,
        });
      });

      await orderItemRepository.save(orderItems);

      const created = await orderRepository.findOne({
        where: { id: order.id },
        relations: { user: true, items: { product: true } },
      });

      if (!created) {
        throw new Error("Order creation failed");
      }

      return created;
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.ordersRepository.findOne({
      where: { id },
      relations: { user: true, items: { product: true } },
    });
  }
}
