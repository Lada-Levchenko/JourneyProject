import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "../users/user.entity";
import { OrderItem } from "./order-item.entity";
import { OrderStatus } from "./order-status.enum";
import { ObjectType, Field, ID, GraphQLISODateTime } from "@nestjs/graphql";

@ObjectType()
@Entity("orders")
@Index("IDX_orders_user_id", ["userId"])
@Index("IDX_orders_created_at", ["createdAt"])
export class Order {
  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid", name: "user_id" })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Field(() => [OrderItem])
  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];

  @Field(() => OrderStatus)
  @Column({
    type: "enum",
    enum: OrderStatus,
    enumName: "orders_status_enum",
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @Field(() => String, { nullable: true })
  @Column({
    type: "varchar",
    length: 120,
    name: "idempotency_key",
    nullable: true,
    unique: true,
  })
  idempotencyKey: string | null;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  @UpdateDateColumn({ type: "timestamptz", name: "updated_at" })
  updatedAt: Date;

  @Field(() => GraphQLISODateTime)
  @CreateDateColumn({ type: "timestamptz", name: "processed_at" })
  processedAt: Date;
}
