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
import { FilesModule } from "./files/files.module";
import { RabbitmqModule } from "./rabbitmq/rabbitmq.module";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.IGNORE_ENV_FILE === "true",
      envFilePath: process.env.APP_ENV_FILE
        ? [process.env.APP_ENV_FILE]
        : [
            join(
              process.cwd(),
              `apps/api/.env.${process.env.NODE_ENV || "local"}`,
            ),
            join(process.cwd(), `.env.${process.env.NODE_ENV || "local"}`),
          ],
      load: [configuration],
    }),
    GqlConfigModule,

    DatabaseModule,

    FilesModule,

    UsersModule,
    AuthModule,

    ProductsModule,
    OrdersModule,
    FilesModule,
    RabbitmqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
