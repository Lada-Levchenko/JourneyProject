import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<string> {
    const user = await this.usersService.findById(id);
    return user?.email ?? "User not found";
  }
}
