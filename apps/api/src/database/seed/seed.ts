import "dotenv/config";
import { In } from "typeorm";
import { AppDataSource as dataSource } from "../data-source";

import { User } from "../../users/user.entity";
import { Product } from "../../products/product.entity";
import { Order, OrderStatus } from "../../orders/order.entity";
import { OrderItem } from "../../orders/order-item.entity";

import { ProductType } from "../../products/product-type.enum";
import { ProductCategory } from "../../products/product-category.enum";
import { PurchasePolicy } from "../../products/purchase-policy.enum";

type SeedOrderItem = {
  id: string;
  productTitle: string;
  quantity: number;
  priceAtPurchase: string;
};

type SeedOrder = {
  id: string;
  idempotencyKey: string;
  userEmail: string;
  items: SeedOrderItem[];
};

const usersSeed = [{ email: "lio@example.com" }, { email: "dan@example.com" }];

const productsSeed: Partial<Product>[] = [
  // One-time digital celebration bundle
  {
    title: "Celebration Bundle: Family",
    type: ProductType.DIGITAL,
    category: ProductCategory.CELEBRATION_BUNDLE,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    price: "5.00",
    stock: null,
  },

  // One-time journey theme
  {
    title: "Journey Theme: Space",
    type: ProductType.DIGITAL,
    category: ProductCategory.JOURNEY_THEME,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    price: "9.00",
    stock: null,
  },
  {
    title: "Journey Theme – Sunrise",
    price: "9.99",
    type: ProductType.DIGITAL,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    stock: null,
    isActive: true,
  },
  {
    title: "Journey Theme – Midnight",
    price: "9.99",
    type: ProductType.DIGITAL,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    stock: null,
    isActive: true,
  },
  {
    title: "Celebrations Bundle (Digital)",
    price: "39.00",
    type: ProductType.DIGITAL,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    stock: null,
    isActive: true,
  },

  // Physical repeatable product
  {
    title: "WeJourney Poster",
    type: ProductType.PHYSICAL,
    category: ProductCategory.POSTER,
    purchasePolicy: PurchasePolicy.REPEATABLE,
    price: "15.00",
    stock: 100,
  },
  {
    title: "Journey Poster – Mountain Edition",
    price: "25.00",
    type: ProductType.PHYSICAL,
    purchasePolicy: PurchasePolicy.REPEATABLE,
    stock: 50,
    isActive: true,
  },
  {
    title: "Journey Notebook",
    price: "12.00",
    type: ProductType.PHYSICAL,
    purchasePolicy: PurchasePolicy.REPEATABLE,
    stock: 100,
    isActive: true,
  },
  {
    title: "Celebrations Bundle (Physical Box)",
    price: "79.00",
    type: ProductType.PHYSICAL,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    stock: 20,
    isActive: true,
  },

  // Donation
  {
    title: "Support WeJourney",
    type: ProductType.DONATION,
    category: ProductCategory.SUPPORT,
    purchasePolicy: PurchasePolicy.REPEATABLE,
    price: null,
    stock: null,
  },
];

const ordersSeed: SeedOrder[] = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    idempotencyKey: "idem-11111111-1111-1111-1111-111111111111",
    userEmail: "lio@example.com",
    items: [
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
        productTitle: "Celebration Bundle: Family",
        quantity: 1,
        priceAtPurchase: "5.00",
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
        productTitle: "Support WeJourney",
        quantity: 1,
        priceAtPurchase: "5.00",
      },
    ],
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    idempotencyKey: "idem-22222222-2222-2222-2222-222222222222",
    userEmail: "dan@example.com",
    items: [
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
        productTitle: "Journey Theme: Space",
        quantity: 1,
        priceAtPurchase: "9.00",
      },
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2",
        productTitle: "WeJourney Poster",
        quantity: 2,
        priceAtPurchase: "15.00",
      },
    ],
  },
];

async function seed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Seeding is disabled in production");
  }

  await dataSource.initialize();

  try {
    const usersRepo = dataSource.getRepository(User);
    const productsRepo = dataSource.getRepository(Product);
    const ordersRepo = dataSource.getRepository(Order);
    const orderItemsRepo = dataSource.getRepository(OrderItem);

    /* Users */
    await usersRepo.upsert(usersSeed, ["email"]);

    const users = await usersRepo.find({
      where: { email: In(usersSeed.map((u) => u.email)) },
    });
    const usersByEmail = new Map(users.map((u) => [u.email, u]));

    /* Products */
    await productsRepo.upsert(productsSeed, ["title"]);

    const products = await productsRepo.find({
      where: { title: In(productsSeed.map((p) => p.title!)) },
    });
    const productsByTitle = new Map(products.map((p) => [p.title, p]));

    /* Orders + Items */
    const ordersToUpsert: Partial<Order>[] = [];
    const orderItemsToUpsert: Partial<OrderItem>[] = [];

    for (const orderSeed of ordersSeed) {
      const user = usersByEmail.get(orderSeed.userEmail);
      if (!user) {
        throw new Error(`Missing user: ${orderSeed.userEmail}`);
      }

      ordersToUpsert.push({
        id: orderSeed.id,
        userId: user.id,
        idempotencyKey: orderSeed.idempotencyKey,
        status: OrderStatus.CREATED,
      });

      for (const item of orderSeed.items) {
        const product = productsByTitle.get(item.productTitle);
        if (!product) {
          throw new Error(`Missing product: ${item.productTitle}`);
        }

        orderItemsToUpsert.push({
          id: item.id,
          orderId: orderSeed.id,
          productId: product.id,
          quantity: item.quantity,
          priceAtPurchase: item.priceAtPurchase,
        });
      }
    }

    if (ordersToUpsert.length) {
      await ordersRepo.upsert(ordersToUpsert, ["id"]);
    }

    if (orderItemsToUpsert.length) {
      await orderItemsRepo.upsert(orderItemsToUpsert, ["id"]);
    }
  } finally {
    await dataSource.destroy();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
