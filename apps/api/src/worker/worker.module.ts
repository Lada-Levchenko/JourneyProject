import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DatabaseModule } from "../database/database.module";
import { OrdersConsumer } from "./orders.consumer";
import { OrdersProcessor } from "./orders.processor";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule],
  providers: [OrdersConsumer, OrdersProcessor],
})
export class WorkerModule {}
