import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import * as amqp from "amqplib";
import { ConfigService } from "@nestjs/config";
import { OrdersProcessor } from "./orders.processor";
import { DuplicateMessageError } from "./errors/duplicate-message.error";
import { NonRetryableError } from "./errors/non-retryable.error";
import { OrderMessage } from "../common/types/message.types";

@Injectable()
export class OrdersConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OrdersConsumer.name);
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;
  private readonly MAX_ATTEMPTS = 3;
  private stopped = false;

  constructor(
    private readonly processor: OrdersProcessor,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    this.stopped = true;
    await this.channel?.close().catch(() => undefined);
    await this.connection?.close().catch(() => undefined);
  }

  private async connectWithRetry() {
    const rabbitUrl = this.configService.getOrThrow<string>("RABBITMQ_URL");

    while (!this.stopped) {
      try {
        this.logger.log("Connecting to RabbitMQ...");
        this.connection = await amqp.connect(rabbitUrl);
        this.channel = await this.connection.createChannel();

        this.connection.on("error", (err) => {
          this.logger.error(`RabbitMQ connection error: ${err.message}`);
        });

        this.connection.on("close", async () => {
          if (this.stopped) return;
          this.logger.warn("RabbitMQ connection closed. Reconnecting...");
          await this.delay(5000);
          await this.connectWithRetry();
        });

        await this.setupTopology();
        this.logger.log(
          "Orders consumer is listening on queue: orders.process",
        );
        return;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `RabbitMQ is unavailable: ${message}. Retrying in 5s...`,
        );
        await this.delay(5000);
      }
    }
  }

  private async setupTopology() {
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

    await this.channel.prefetch(1);

    await this.channel.consume(
      "orders.process",
      async (msg: amqp.ConsumeMessage | null) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());
        const attempt = data.attempt ?? 0;
        const messageId = data.messageId ?? msg.properties.messageId ?? null;
        const orderId = data.orderId ?? null;

        this.logMessage({
          messageId,
          orderId,
          attempt,
          result: "received",
        });

        try {
          await this.processor.process(data);

          this.logMessage({
            messageId,
            orderId,
            attempt,
            result: "success",
          });

          this.channel.ack(msg);
        } catch (err) {
          const errorReason = this.getShortErrorReason(err);

          this.logger.error(
            `Worker processing failed: messageId=${messageId}, orderId=${orderId}, attempt=${attempt}, reason=${errorReason}`,
            err instanceof Error ? err.stack : undefined,
          );

          if (err instanceof DuplicateMessageError) {
            this.logMessage({
              messageId,
              orderId,
              attempt,
              result: "duplicate",
              errorReason,
            });

            this.channel.ack(msg);
            return;
          }

          if (err instanceof NonRetryableError) {
            this.sendToDlq(data);

            this.logMessage({
              messageId,
              orderId,
              attempt,
              result: "dlq",
              errorReason,
            });

            this.channel.ack(msg);
            return;
          }

          if (attempt < this.MAX_ATTEMPTS) {
            this.retryMessage(data, attempt);

            this.logMessage({
              messageId,
              orderId,
              attempt,
              result: "retry",
              errorReason,
            });

            this.channel.ack(msg);
            return;
          }

          this.sendToDlq(data);

          this.logMessage({
            messageId,
            orderId,
            attempt,
            result: "dlq",
            errorReason,
          });

          this.channel.ack(msg);
        }
      },
    );
  }

  private retryMessage(data: OrderMessage, attempt: number) {
    const retryMessage = {
      ...data,
      attempt: attempt + 1,
    };

    const delayMs = 1000 * (attempt + 1);

    setTimeout(() => {
      this.channel.publish(
        "orders.exchange",
        "orders.process",
        Buffer.from(JSON.stringify(retryMessage)),
        {
          persistent: true,
          messageId: retryMessage.messageId,
          timestamp: Date.now(),
        },
      );
    }, delayMs);
  }

  private sendToDlq(data: OrderMessage): boolean {
    try {
      this.channel.publish(
        "orders.exchange",
        "orders.dlq",
        Buffer.from(JSON.stringify(data)),
        {
          persistent: true,
          messageId: data.messageId,
          timestamp: Date.now(),
        },
      );

      this.logger.warn(
        `Message sent to DLQ: messageId=${data.messageId ?? null}, orderId=${data.orderId ?? null}`,
      );
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to send message to DLQ: messageId=${data.messageId ?? null}, error=${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  }

  private getShortErrorReason(err: unknown): string {
    if (err instanceof DuplicateMessageError) {
      return "duplicate_message";
    }

    if (err instanceof NonRetryableError) {
      return err.message || "non_retryable_error";
    }

    if (err instanceof Error) {
      return err.message;
    }

    return String(err);
  }

  private logMessage(params: {
    messageId: string | null;
    orderId: string | null;
    attempt: number;
    result: "received" | "success" | "retry" | "dlq" | "duplicate";
    errorReason?: string;
  }) {
    const { messageId, orderId, attempt, result, errorReason } = params;

    const parts = [
      `messageId=${messageId}`,
      `orderId=${orderId}`,
      `attempt=${attempt}`,
      `result=${result}`,
    ];

    if (errorReason) {
      parts.push(`errorReason=${errorReason}`);
    }

    const line = parts.join(", ");

    if (result === "dlq" || result === "retry") {
      this.logger.warn(line);
      return;
    }

    this.logger.log(line);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
