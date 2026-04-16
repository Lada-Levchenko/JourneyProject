import { Module } from "@nestjs/common";
import { Product } from "./product.entity";
import { ProductsService } from "./products.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsController } from "./product.controller";
import { ProductsLoader } from "./products.loader";

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService, ProductsLoader],
  controllers: [ProductsController],
  exports: [ProductsService, ProductsLoader],
})
export class ProductsModule {}
