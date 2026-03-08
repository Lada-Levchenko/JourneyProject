import { ProductCategory } from "../../../products/product-category.enum";
import { ProductType } from "../../../products/product-type.enum";
import { Product } from "../../../products/product.entity";
import { PurchasePolicy } from "../../../products/purchase-policy.enum";

export const productsSeed: Partial<Product>[] = [
  // One-time digital celebration bundle
  {
    title: "Celebration Bundle: Family",
    type: ProductType.DIGITAL,
    category: ProductCategory.CELEBRATION_BUNDLE,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    price: "5.00",
    stock: null,
  },

  // One-time journey theme
  {
    title: "Journey Theme: Space",
    type: ProductType.DIGITAL,
    category: ProductCategory.JOURNEY_THEME,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    price: "9.00",
    stock: null,
  },
  {
    title: "Journey Theme – Sunrise",
    price: "9.99",
    type: ProductType.DIGITAL,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    stock: null,
    isActive: true,
  },
  {
    title: "Journey Theme – Midnight",
    price: "9.99",
    type: ProductType.DIGITAL,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    stock: null,
    isActive: true,
  },
  {
    title: "Celebrations Bundle (Digital)",
    price: "39.00",
    type: ProductType.DIGITAL,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    stock: null,
    isActive: true,
  },

  // Physical repeatable product
  {
    title: "WeJourney Poster",
    type: ProductType.PHYSICAL,
    category: ProductCategory.POSTER,
    purchasePolicy: PurchasePolicy.REPEATABLE,
    price: "15.00",
    stock: 100,
  },
  {
    title: "Journey Poster – Mountain Edition",
    price: "25.00",
    type: ProductType.PHYSICAL,
    purchasePolicy: PurchasePolicy.REPEATABLE,
    stock: 50,
    isActive: true,
  },
  {
    title: "Journey Notebook",
    price: "12.00",
    type: ProductType.PHYSICAL,
    purchasePolicy: PurchasePolicy.REPEATABLE,
    stock: 100,
    isActive: true,
  },
  {
    title: "Celebrations Bundle (Physical Box)",
    price: "79.00",
    type: ProductType.PHYSICAL,
    purchasePolicy: PurchasePolicy.ONE_TIME,
    stock: 20,
    isActive: true,
  },

  // Donation
  {
    title: "Support WeJourney",
    type: ProductType.DONATION,
    category: ProductCategory.SUPPORT,
    purchasePolicy: PurchasePolicy.REPEATABLE,
    price: null,
    stock: null,
  },
];
