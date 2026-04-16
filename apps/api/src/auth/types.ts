import { GlobalRole } from "../users/global-role.enum";

export interface JwtPayload {
  sub: string;
  email: string;
  role: GlobalRole;
}

export interface AuthUser {
  sub: string;
  email: string;
  globalRole: GlobalRole;
}
