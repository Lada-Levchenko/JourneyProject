import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { Request } from "express";

const isPlaygroundEnabled = process.env.IS_PLAYGROUND_ENABLED === "true";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: isPlaygroundEnabled || join(process.cwd(), "schema.gql"),
      playground: isPlaygroundEnabled,
      introspection: isPlaygroundEnabled,
      sortSchema: true,
      context: ({ req }: { req: Request }) => ({ req }),
    }),
  ],
})
export class GqlConfigModule {}
