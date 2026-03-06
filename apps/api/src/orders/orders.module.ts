import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./order.entity";
import { OrderItem } from "./order-item.entity";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { OrdersResolver } from "./orders.resolver";
import { OrderItemsResolver } from "./order-items.resolver";
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), ProductsModule],
  providers: [OrdersService, OrdersResolver, OrderItemsResolver],
  controllers: [OrdersController],
})
export class OrdersModule {}
