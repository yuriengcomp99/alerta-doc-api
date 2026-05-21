import { hashToken } from "../../../lib/token.js";
import { toAuthUser } from "../mappers/user.mapper.js";
import type { IAuthSessionRepository } from "../repositories/auth-session.repository.js";
import type { AccessTokenValidation } from "../types/auth.types.js";

export class ValidateAccessTokenUseCase {
  constructor(private readonly sessions: IAuthSessionRepository) {}

  async execute(accessToken: string): Promise<AccessTokenValidation | null> {
    const session = await this.sessions.findValidByAccessToken(
      hashToken(accessToken),
    );

    if (!session?.user.active) return null;

    return {
      sessionId: session.id,
      user: toAuthUser(session.user),
      accessExpiresAt: session.accessExpiresAt,
    };
  }
}
