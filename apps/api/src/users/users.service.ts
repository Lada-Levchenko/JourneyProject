import { Injectable } from "@nestjs/common";
import { User } from "./user.interface";

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    { id: "1", name: "Lada", email: "lada@example.com" },
  ];

  findOne(id: string): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}
