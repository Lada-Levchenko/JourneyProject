import { Module } from "@nestjs/common";
import { OrdersConsumer } from "./orders.consumer";

@Module({})
export class WorkerModule {
  providers: [OrdersConsumer];
}
