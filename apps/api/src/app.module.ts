import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { DatabaseModule } from "./database/database.module";
import configuration from "./config/configuration";
import { AuthModule } from "./auth/auth.module";
import { GqlConfigModule } from "./graphql/graphql.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || "local"}`,
      load: [configuration],
    }),
    GqlConfigModule,

    DatabaseModule,

    UsersModule,
    AuthModule,

    ProductsModule,
    OrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
