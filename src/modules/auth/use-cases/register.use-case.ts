import bcrypt from "bcryptjs";
import { AppError } from "../../../middleware/http.js";
import { toAuthUser } from "../mappers/user.mapper.js";
import type { IUserRepository } from "../repositories/user.repository.js";
import type { AuthResult } from "../types/auth.types.js";
import { IssueTokensUseCase } from "./issue-tokens.use-case.js";

const BCRYPT_ROUNDS = 12;

export class RegisterUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly issueTokens: IssueTokensUseCase,
  ) {}

  async execute(
    email: string,
    password: string,
    name?: string,
  ): Promise<AuthResult> {
    const normalized = email.trim().toLowerCase();

    if (await this.users.findByEmail(normalized)) {
      throw new AppError(409, "E-mail já cadastrado", "EMAIL_ALREADY_EXISTS");
    }

    const user = await this.users.create({
      email: normalized,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      name: name?.trim() || null,
    });

    return this.issueTokens.execute(toAuthUser(user));
  }
}
