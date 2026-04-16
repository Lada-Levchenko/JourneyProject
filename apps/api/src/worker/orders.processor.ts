import { Injectable, Logger } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

import { Order } from "../orders/order.entity";
import { OrderStatus } from "../orders/order-status.enum";
import { ProcessedMessage } from "./idempotency/processed-message.entity";
import { NonRetryableError } from "./errors/non-retryable.error";
import { DuplicateMessageError } from "./errors/duplicate-message.error";
import { OrderMessage } from "../common/types/message.types";

@Injectable()
export class OrdersProcessor {
  private readonly logger = new Logger(OrdersProcessor.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async process(data: OrderMessage) {
    return this.dataSource.transaction(async (manager) => {
      try {
        await manager.insert(ProcessedMessage, {
          handler: "order.process",
          messageId: data.messageId,
          idempotencyKey: data.idempotencyKey ?? null,
        });
      } catch (e: unknown) {
        if (
          typeof e === "object" &&
          e !== null &&
          "code" in e &&
          (e as { code?: string }).code === "23505"
        ) {
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

      await this.simulateWork();

      order.status = OrderStatus.COMPLETED;
      order.processedAt = new Date();

      await manager.save(order);

      this.logger.log(
        `Order marked as completed: orderId=${data.orderId}, messageId=${data.messageId ?? null}`,
      );
    });
  }

  private async simulateWork() {
    const delay = 200 + Math.random() * 300;
    return new Promise((res) => setTimeout(res, delay));
  }
}
