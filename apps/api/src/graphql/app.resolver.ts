import { InternalServerErrorException } from "@nestjs/common";
import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class AppResolver {
  @Query(() => String)
  hello(): string {
    return "Hello";
  }

  @Query(() => String)
  testError(): string {
    throw new InternalServerErrorException("Server Error");
  }
}
