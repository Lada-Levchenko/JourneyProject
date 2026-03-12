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
import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  ObjectType,
} from "@nestjs/graphql";

@ObjectType()
@Entity("products")
@Index("IDX_products_title_unique", ["title"], { unique: true })
export class Product {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Field(() => String)
  @Column({ type: "varchar", length: 200 })
  title: string;

  @Field(() => ProductType)
  @Column({
    type: "enum",
    enum: ProductType,
    default: ProductType.DONATION,
  })
  type: ProductType;

  @Field(() => ProductCategory)
  @Column({
    type: "enum",
    enum: ProductCategory,
    default: ProductCategory.SUPPORT,
  })
  category: ProductCategory;

  @Field(() => PurchasePolicy)
  @Column({
    type: "enum",
    enum: PurchasePolicy,
    default: PurchasePolicy.REPEATABLE,
  })
  purchasePolicy: PurchasePolicy;

  @Field(() => Float, { nullable: true })
  @Column("numeric", { precision: 12, scale: 2, nullable: true })
  price: string | null;

  @Field(() => Float, { nullable: true })
  @Column({ type: "int", nullable: true })
  stock: number | null;

  @Field(() => Boolean)
  @Column({ type: "boolean", name: "is_active", default: true })
  isActive: boolean;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.product)
  orderItems: OrderItem[];

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;
}
