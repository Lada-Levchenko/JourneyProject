import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as amqp from "amqplib";

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.connection = await amqp.connect(
      this.configService.get<string>("RABBITMQ_URL")!,
    );
    this.channel = await this.connection.createChannel();

    await this.channel.assertQueue("orders.process", {
      durable: true,
    });
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
  }
}
