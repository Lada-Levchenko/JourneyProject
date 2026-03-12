import { registerEnumType } from "@nestjs/graphql";

export enum ProductType {
  PHYSICAL = "physical",
  DIGITAL = "digital",
  DONATION = "donation",
}

registerEnumType(ProductType, {
  name: "ProductType",
});
