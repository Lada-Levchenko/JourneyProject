import { GlobalRole } from "../../../users/global-role.enum";
import { User } from "../../../users/user.entity";

export const usersSeed: Partial<User>[] = [
  {
    email: "lio@example.com",
    globalRole: GlobalRole.USER,
  },
  {
    email: "dan@example.com",
    globalRole: GlobalRole.USER,
  },
  {
    email: "admin@wejourney.app",
    globalRole: GlobalRole.SUPER_ADMIN,
  },
];
