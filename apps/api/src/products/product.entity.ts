import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OrderItem } from "../orders/order-item.entity";
import { ProductType } from "./product-type.enum";
import { ProductCategory } from "./product-category.enum";
import { PurchasePolicy } from "./purchase-policy.enum";

@Entity("products")
@Index("IDX_products_title_unique", ["title"], { unique: true })
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 200 })
  title: string;

  @Column({
    type: "enum",
    enum: ProductType,
    default: ProductType.DONATION,
  })
  type: ProductType;

  @Column({
    type: "enum",
    enum: ProductCategory,
    default: ProductCategory.SUPPORT,
  })
  category: ProductCategory;

  @Column({
    type: "enum",
    enum: PurchasePolicy,
    default: PurchasePolicy.REPEATABLE,
  })
  purchasePolicy: PurchasePolicy;

  @Column("numeric", { precision: 12, scale: 2, nullable: true })
  price: string | null;

  @Column({ type: "int", nullable: true })
  stock: number | null;

  @Column({ type: "boolean", name: "is_active", default: true })
  isActive: boolean;

  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;
}
