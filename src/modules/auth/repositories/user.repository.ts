import type { UserRecord } from "../mappers/user.mapper.js";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  create(data: {
    email: string;
    passwordHash: string;
    name: string | null;
  }): Promise<UserRecord>;
}
