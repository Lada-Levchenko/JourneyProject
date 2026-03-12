import { InputType, Field, Int } from "@nestjs/graphql";
import { IsOptional, Min } from "class-validator";

@InputType()
export class OrdersPaginationInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  cursor?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @Min(1)
  limit?: number;
}
