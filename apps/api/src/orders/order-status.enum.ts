import { registerEnumType } from "@nestjs/graphql";

export enum OrderStatus {
  CREATED = "CREATED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAID = "PAID",
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PROCESSING = "PROCESSING",
  PROCESSING_FAILED = "PROCESSING_FAILED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

registerEnumType(OrderStatus, {
  name: "OrderStatus",
});
