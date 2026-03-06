import { InputType, Field, GraphQLISODateTime } from "@nestjs/graphql";
import { OrderStatus } from "../order-status.enum";

@InputType()
export class OrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  status?: OrderStatus;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dateFrom?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  dateTo?: string;
}
