import { InputType, Field, Int } from "@nestjs/graphql";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

@InputType()
export class OrdersPaginationInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cursor?: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}
