import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";

const isProd = process.env.NODE_ENV === "production";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: isProd || join(process.cwd(), "schema.gql"),
      playground: !isProd,
      sortSchema: true,
    }),
  ],
})
export class GqlConfigModule {}
