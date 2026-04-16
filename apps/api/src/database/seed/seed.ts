import "dotenv/config";
import { In } from "typeorm";
import { AppDataSource as dataSource } from "../data-source";

import { User } from "../../users/user.entity";
import { Product } from "../../products/product.entity";
import { Order } from "../../orders/order.entity";
import { OrderItem } from "../../orders/order-item.entity";
import { OrderStatus } from "../../orders/order-status.enum";
import * as bcrypt from "bcrypt";
import { usersSeed } from "./entities/users";
import { productsSeed } from "./entities/products";
import { ordersSeed } from "./entities/orders";

async function seed() {
  await dataSource.initialize();

  try {
    const usersRepo = dataSource.getRepository(User);
    const productsRepo = dataSource.getRepository(Product);
    const ordersRepo = dataSource.getRepository(Order);
    const orderItemsRepo = dataSource.getRepository(OrderItem);

    /* Users */
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123";
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    const usersWithPasswords = usersSeed.map((user) => ({
      ...user,
      passwordHash: adminPasswordHash,
    }));

    await usersRepo.upsert(usersWithPasswords, ["email"]);

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
        status: OrderStatus.PENDING,
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
