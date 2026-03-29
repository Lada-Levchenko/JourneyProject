import { Injectable } from "@nestjs/common";
import { DataSource } from "typeorm";

import { Order } from "../orders/order.entity";
import { OrderStatus } from "../orders/order-status.enum";
import { ProcessedMessage } from "./idempotency/processed-message.entity";
import { NonRetryableError } from "./errors/non-retryable.error";
import { DuplicateMessageError } from "./errors/duplicate-message.error";

@Injectable()
export class OrdersProcessor {
  constructor(private readonly dataSource: DataSource) {}

  async process(data: any) {
    return this.dataSource.transaction(async (manager) => {
      try {
        await manager.insert(ProcessedMessage, {
          handler: "order.process",
          messageId: data.messageId,
          idempotencyKey: data.idempotencyKey ?? null,
        });
      } catch (e: any) {
        if (e.code === "23505") {
          throw new DuplicateMessageError();
        }
        throw e;
      }

      const order = await manager.findOne(Order, {
        where: { id: data.orderId },
      });

      if (!order) {
        throw new NonRetryableError("Order not found");
      }

      this.simulateWork();

      order.status = OrderStatus.COMPLETED;
      order.processedAt = new Date();

      await manager.save(order);
    });
  }

  private async simulateWork() {
    const delay = 200 + Math.random() * 300;
    return new Promise((res) => setTimeout(res, delay));
  }
}
