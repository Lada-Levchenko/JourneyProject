import { Injectable, OnModuleInit } from "@nestjs/common";
import * as amqp from "amqplib";
import { ConfigService } from "@nestjs/config";

import { OrdersProcessor } from "./orders.processor";
import { DuplicateMessageError } from "./errors/duplicate-message.error";
import { NonRetryableError } from "./errors/non-retryable.error";

@Injectable()
export class OrdersConsumer implements OnModuleInit {
  private channel: amqp.Channel;
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    private readonly processor: OrdersProcessor,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const connection = await amqp.connect(
      this.configService.get<string>("RABBITMQ_URL")!,
    );

    this.channel = await connection.createChannel();
    await this.channel.assertExchange("orders.exchange", "direct", {
      durable: true,
    });

    await this.channel.assertQueue("orders.process", { durable: true });
    await this.channel.assertQueue("orders.dlq", { durable: true });

    await this.channel.bindQueue(
      "orders.process",
      "orders.exchange",
      "orders.process",
    );

    await this.channel.bindQueue("orders.dlq", "orders.exchange", "orders.dlq");

    this.channel.prefetch(1);

    await this.channel.consume("orders.process", async (msg) => {
      if (!msg) return;

      const data = JSON.parse(msg.content.toString());
      const attempt = data.attempt ?? 0;

      try {
        await this.processor.process(data);

        this.channel.ack(msg);
      } catch (err) {
        console.error("Worker error:", err);

        if (err instanceof DuplicateMessageError) {
          this.channel.ack(msg);
          return;
        }

        if (err instanceof NonRetryableError) {
          this.sendToDlq(data);
          this.channel.ack(msg);
          return;
        }

        if (attempt < this.MAX_ATTEMPTS) {
          this.retryMessage(data, attempt);
          this.channel.ack(msg);
          return;
        }

        this.sendToDlq(data);
        this.channel.ack(msg);
      }
    });
  }

  private retryMessage(data: any, attempt: number) {
    const retryMessage = {
      ...data,
      attempt: attempt + 1,
    };

    setTimeout(
      () => {
        this.channel.publish(
          "orders.exchange",
          "orders.process",
          Buffer.from(JSON.stringify(retryMessage)),
          { persistent: true },
        );
      },
      1000 * (attempt + 1),
    );
  }

  private sendToDlq(data: any) {
    this.channel.publish(
      "orders.exchange",
      "orders.dlq",
      Buffer.from(JSON.stringify(data)),
      { persistent: true },
    );
  }
}
