import { InputType, Field, GraphQLISODateTime } from "@nestjs/graphql";
import { OrderStatus } from "../order-status.enum";
import { IsDate, IsEnum, IsOptional } from "class-validator";
import { Type } from "class-transformer";

@InputType()
export class OrdersFilterInput {
  @Field(() => OrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: string;
}
