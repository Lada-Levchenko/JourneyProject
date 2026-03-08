import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { GlobalRole } from "./global-role.enum";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(GlobalRole.SUPER_ADMIN)
  @Get()
  async findAll(): Promise<string[]> {
    const users = await this.usersService.findAll();
    return users.map((user: User) => user.email);
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<string> {
    const user = await this.usersService.findById(id);
    return user?.email ?? "User not found";
  }
}
