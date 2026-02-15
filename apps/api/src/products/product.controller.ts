import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async listProducts(
    @Query("type") type: string,
    @Query("category") category?: string,
    @Query("search") search?: string,
    @Query("cursor") cursor?: string,
    @Query("limit") limit = "10",
  ) {
    if (!type) {
      throw new BadRequestException("type is required");
    }
    return this.productsService.listProducts({
      type,
      category,
      search,
      cursor,
      limit: parseInt(limit, 10),
    });
  }
}
