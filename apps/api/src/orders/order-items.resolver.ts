import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { OrderItem } from "./order-item.entity";
import { Product } from "../products/product.entity";
import { ProductsLoader } from "../products/products.loader";

@Resolver(() => OrderItem)
export class OrderItemsResolver {
  constructor(private readonly productsLoader: ProductsLoader) {}

  @ResolveField(() => Product)
  async product(@Parent() orderItem: OrderItem) {
    return this.productsLoader.load(orderItem.productId);
  }
}
