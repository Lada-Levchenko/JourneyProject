import DataLoader from "dataloader";
import { Injectable, Scope } from "@nestjs/common";
import { ProductsService } from "../products/products.service";
import { Product } from "../products/product.entity";

@Injectable({ scope: Scope.REQUEST })
export class ProductsLoader extends DataLoader<string, Product | null> {
  constructor(private readonly productsService: ProductsService) {
    super(async (productIds: readonly string[]) => {
      const products = await this.productsService.findByIds([...productIds]);

      const map = new Map(products.map((p) => [p.id, p]));

      return productIds.map((id) => map.get(id) ?? null);
    });
  }
}
