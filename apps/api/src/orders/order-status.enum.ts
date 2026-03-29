import { registerEnumType } from "@nestjs/graphql";

export enum OrderStatus {
  CREATED = "CREATED",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  PAID = "PAID",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

registerEnumType(OrderStatus, {
  name: "OrderStatus",
});
