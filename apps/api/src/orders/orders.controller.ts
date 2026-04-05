import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    if (!dto?.userId || !Array.isArray(dto.items)) {
      throw new BadRequestException("userId and items are required");
    }

    return this.ordersService.createOrder(dto);
  }

  @Get()
  async listOrders(@Query("userId") userId?: string) {
    return this.ordersService.listOrders(userId);
  }

  @Post(":id/pay")
  pay(@Param("id") id: string) {
    return this.ordersService.payOrder(id);
  }
}
