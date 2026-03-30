import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.connection = await amqp.connect(
      this.configService.getOrThrow<string>("RABBITMQ_URL"),
    );
    this.channel = await this.connection.createChannel();

    await this.channel.assertExchange("orders.exchange", "direct", {
      durable: true,
    });

    await this.channel.assertQueue("orders.process", {
      durable: true,
    });

    await this.channel.bindQueue(
      "orders.process",
      "orders.exchange",
      "orders.process",
    );
  }

  async publishOrder(message: any) {
    this.channel.publish(
      "orders.exchange",
      "orders.process",
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
        messageId: message.messageId,
        timestamp: Date.now(),
      },
    );

    this.logger.log(
      `Order message published: messageId=${message.messageId ?? null}, orderId=${message.orderId ?? null}`,
    );
  }
}
