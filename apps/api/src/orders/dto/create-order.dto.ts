import { IsArray, IsOptional, IsUUID, ValidateNested } from "class-validator";
import { CreateOrderItemDto } from "./create-order-item-dto";
import { Type } from "class-transformer";

export class CreateOrderDto {
  @IsUUID()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsUUID()
  idempotencyKey?: string;
}
