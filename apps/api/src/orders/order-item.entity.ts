import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Order } from "./order.entity";
import { Product } from "./../products/product.entity";
import { ObjectType, Field, ID, Int } from "@nestjs/graphql";

@ObjectType()
@Entity("order_items")
@Index("IDX_order_items_order_id", ["orderId"])
@Index("IDX_order_items_product_id", ["productId"])
// Ensure a product can only appear once per order
@Index("UQ_order_product", ["orderId", "productId"], { unique: true })
export class OrderItem {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "order_id" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" })
  order: Order;

  @Column({ type: "uuid", name: "product_id" })
  productId: string;

  @Field(() => Product)
  @ManyToOne(() => Product, (product) => product.orderItems, {
    onDelete: "RESTRICT",
  })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @Field(() => Int)
  @Column({ type: "int" })
  quantity: number;

  @Field(() => String)
  @Column("numeric", { precision: 12, scale: 2, name: "price_at_purchase" })
  priceAtPurchase: string;
}
