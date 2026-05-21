import { prisma } from "../../../lib/prisma.js";
import type { UserRecord } from "../mappers/user.mapper.js";
import type { IUserRepository } from "./user.repository.js";

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name: string | null;
  }): Promise<UserRecord> {
    return prisma.user.create({ data });
  }
}
