import type { IAuthSessionRepository } from "../repositories/auth-session.repository.js";
import type { AuthResult, AuthUser } from "../types/auth.types.js";

export class IssueTokensUseCase {
  constructor(private readonly sessions: IAuthSessionRepository) {}

  async execute(user: AuthUser): Promise<AuthResult> {
    const tokens = await this.sessions.create(user.id);
    return { user, tokens };
  }
}
