import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { Request } from "express";
import type { AuthUser } from "./types";
import { ROLES_KEY } from "./roles.decorator";
import { GlobalRole } from "../users/global-role.enum";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<GlobalRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = this.getRequest(context);
    const userRole = req.user?.globalRole;

    if (!userRole || !requiredRoles.includes(userRole)) {
      throw new ForbiddenException("Insufficient role");
    }

    return true;
  }

  private getRequest(context: ExecutionContext): Request & { user?: AuthUser } {
    const gqlContext = GqlExecutionContext.create(context);
    return gqlContext.getContext().req;
  }
}
