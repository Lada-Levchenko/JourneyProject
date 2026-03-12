import { registerEnumType } from "@nestjs/graphql";

export enum PurchasePolicy {
  ONE_TIME = "one_time",
  REPEATABLE = "repeatable",
}

registerEnumType(PurchasePolicy, {
  name: "PurchasePolicy",
});
