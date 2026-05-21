import bcrypt from "bcryptjs";
import { AppError } from "../../../middleware/http.js";
import { toAuthUser } from "../mappers/user.mapper.js";
import type { IUserRepository } from "../repositories/user.repository.js";
import type { AuthResult } from "../types/auth.types.js";
import { IssueTokensUseCase } from "./issue-tokens.use-case.js";

export class LoginUseCase {
  constructor(
    private readonly users: IUserRepository,
    private readonly issueTokens: IssueTokensUseCase,
  ) {}

  async execute(email: string, password: string): Promise<AuthResult> {
    const user = await this.users.findByEmail(email.trim().toLowerCase());

    if (
      !user?.active ||
      !user.passwordHash ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new AppError(401, "Credenciais inválidas", "INVALID_CREDENTIALS");
    }

    return this.issueTokens.execute(toAuthUser(user));
  }
}
