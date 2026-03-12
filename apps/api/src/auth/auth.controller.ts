import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { AuthUser } from "./types";

type LoginBody = {
  email: string;
  password: string;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginBody): Promise<{ accessToken: string }> {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: Request & { user?: AuthUser }): AuthUser {
    return req.user as AuthUser;
  }
}
