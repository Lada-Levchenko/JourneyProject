import { Args, Query, Resolver } from "@nestjs/graphql";
import { Order } from "./order.entity";
import { OrdersService } from "./orders.service";
import { OrdersFilterInput } from "./dto/orders-filter.input";
import { OrdersPaginationInput } from "./dto/orders-pagination.input";
import { OrdersConnection } from "./dto/orders-connection.type";
import { UseGuards } from "@nestjs/common";
import { GqlAuthGuard } from "../auth/gql-auth.guard";

@Resolver(() => Order)
export class OrdersResolver {
  constructor(private readonly orderService: OrdersService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => OrdersConnection)
  orders(
    @Args("filter", { nullable: true }) filter?: OrdersFilterInput,
    @Args("pagination", { nullable: true }) pagination?: OrdersPaginationInput,
  ): Promise<OrdersConnection> {
    return this.orderService.findAll(filter, pagination);
  }
}
