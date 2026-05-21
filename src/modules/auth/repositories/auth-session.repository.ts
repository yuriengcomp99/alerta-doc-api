import type { UserRecord } from "../mappers/user.mapper.js";
import type { TokenPair } from "../types/auth.types.js";

export type SessionWithUser = {
  id: string;
  accessExpiresAt: Date;
  user: UserRecord;
};

export interface IAuthSessionRepository {
  create(userId: string): Promise<TokenPair>;
  findValidByRefreshToken(tokenHash: string): Promise<SessionWithUser | null>;
  findValidByAccessToken(tokenHash: string): Promise<SessionWithUser | null>;
  revoke(id: string): Promise<void>;
  revokeByTokenHash(
    field: "accessTokenHash" | "refreshTokenHash",
    tokenHash: string,
  ): Promise<void>;
}
