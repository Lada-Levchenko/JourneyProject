import { registerEnumType } from "@nestjs/graphql";

export enum OrderStatus {
  CREATED = "CREATED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

registerEnumType(OrderStatus, {
  name: "OrderStatus",
});
