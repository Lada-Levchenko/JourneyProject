import { registerEnumType } from "@nestjs/graphql";

export enum ProductCategory {
  CELEBRATION_BUNDLE = "celebration_bundle",
  JOURNEY_THEME = "journey_theme",
  POSTER = "poster",
  SUPPORT = "support",
}

registerEnumType(ProductCategory, {
  name: "ProductCategory",
});
