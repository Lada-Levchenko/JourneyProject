import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { Order } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { OrdersResolver } from "./orders.resolver";
import { OrderItemsResolver } from "./order-items.resolver";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "PAYMENTS_PACKAGE",
        transport: Transport.GRPC,
        options: {
          package: "payments",
          protoPath: join(
            __dirname,
            "../../../../packages/contracts/payments.proto",
          ),
          url: process.env.PAYMENTS_GRPC_URL || "localhost:50051",
        },
      },
    ]),
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule,
  ],
  providers: [OrdersService, OrdersResolver, OrderItemsResolver],
  controllers: [OrdersController],
})
export class OrdersModule {}
