import { env } from "../../../config/env.js";
import { prisma } from "../../../lib/prisma.js";
import {
  expiresAtFromNow,
  generateOpaqueToken,
  hashToken,
} from "../../../lib/token.js";
import type { TokenPair } from "../types/auth.types.js";
import type {
  IAuthSessionRepository,
  SessionWithUser,
} from "./auth-session.repository.js";

export class PrismaAuthSessionRepository implements IAuthSessionRepository {
  async create(userId: string): Promise<TokenPair> {
    const accessToken = generateOpaqueToken();
    const refreshToken = generateOpaqueToken();

    const session = await prisma.authSession.create({
      data: {
        userId,
        accessTokenHash: hashToken(accessToken),
        refreshTokenHash: hashToken(refreshToken),
        accessExpiresAt: expiresAtFromNow(env.accessTokenExpiresIn),
        refreshExpiresAt: expiresAtFromNow(env.refreshTokenExpiresIn),
      },
    });

    return {
      accessToken,
      refreshToken,
      accessExpiresAt: session.accessExpiresAt,
      refreshExpiresAt: session.refreshExpiresAt,
    };
  }

  async findValidByRefreshToken(tokenHash: string): Promise<SessionWithUser | null> {
    return prisma.authSession.findFirst({
      where: {
        refreshTokenHash: tokenHash,
        revokedAt: null,
        refreshExpiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  async findValidByAccessToken(tokenHash: string): Promise<SessionWithUser | null> {
    return prisma.authSession.findFirst({
      where: {
        accessTokenHash: tokenHash,
        revokedAt: null,
        accessExpiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  }

  async revoke(id: string): Promise<void> {
    await prisma.authSession.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeByTokenHash(
    field: "accessTokenHash" | "refreshTokenHash",
    tokenHash: string,
  ): Promise<void> {
    await prisma.authSession.updateMany({
      where: { [field]: tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
