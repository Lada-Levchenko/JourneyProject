import { Type } from "class-transformer";
import { IsInt, IsNumberString, IsOptional, IsUUID } from "class-validator";

export class CreateOrderItemDto {
  @IsUUID()
  productId: string;

  @Type(() => Number)
  @IsInt()
  quantity: number;

  @IsOptional()
  @IsNumberString()
  priceAtPurchase?: string; // only needed for DONATION, the rest should be determined server-side
}
