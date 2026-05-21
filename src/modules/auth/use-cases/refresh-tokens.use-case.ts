import { hashToken } from "../../../lib/token.js";
import { AppError } from "../../../middleware/http.js";
import { toAuthUser } from "../mappers/user.mapper.js";
import type { IAuthSessionRepository } from "../repositories/auth-session.repository.js";
import type { AuthResult } from "../types/auth.types.js";
import { IssueTokensUseCase } from "./issue-tokens.use-case.js";

export class RefreshTokensUseCase {
  constructor(
    private readonly sessions: IAuthSessionRepository,
    private readonly issueTokens: IssueTokensUseCase,
  ) {}

  async execute(refreshToken: string): Promise<AuthResult> {
    const session = await this.sessions.findValidByRefreshToken(
      hashToken(refreshToken),
    );

    if (!session?.user.active) {
      throw new AppError(
        401,
        "Refresh token inválido ou expirado",
        "INVALID_REFRESH_TOKEN",
      );
    }

    await this.sessions.revoke(session.id);
    return this.issueTokens.execute(toAuthUser(session.user));
  }
}
