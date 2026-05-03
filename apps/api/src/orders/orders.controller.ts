import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Roles } from "../auth/roles.decorator";
import { GlobalRole } from "../users/global-role.enum";
import { CurrentUser } from "../common/errors/decorators/current-user.decorator";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Roles(GlobalRole.SUPER_ADMIN)
  @Get("all")
  async listAllOrders() {
    return this.ordersService.listOrders(undefined);
  }

  @Get()
  async listOwnOrders(@CurrentUser() user: any) {
    return this.ordersService.listOrders(user.id);
  }

  @Post(":id/pay")
  pay(@Param("id") id: string) {
    return this.ordersService.payOrder(id);
  }
}
