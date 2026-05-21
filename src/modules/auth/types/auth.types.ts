import type { Request } from "express";

export type UserRole = "USER" | "ADMIN";

export type AuthRequest = Request & { auth?: AuthUser };

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
};

export type AuthResult = {
  user: AuthUser;
  tokens: TokenPair;
};

export type AccessTokenValidation = {
  sessionId: string;
  user: AuthUser;
  accessExpiresAt: Date;
};
