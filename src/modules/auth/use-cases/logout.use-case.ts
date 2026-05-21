import { hashToken } from "../../../lib/token.js";
import type { IAuthSessionRepository } from "../repositories/auth-session.repository.js";

export class LogoutUseCase {
  constructor(private readonly sessions: IAuthSessionRepository) {}

  async execute(refreshToken?: string, accessToken?: string): Promise<void> {
    if (refreshToken) {
      await this.sessions.revokeByTokenHash(
        "refreshTokenHash",
        hashToken(refreshToken),
      );
      return;
    }

    if (accessToken) {
      await this.sessions.revokeByTokenHash(
        "accessTokenHash",
        hashToken(accessToken),
      );
    }
  }
}
