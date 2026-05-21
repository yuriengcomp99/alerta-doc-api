import type { RequestHandler } from "express";
import { bearerToken } from "./auth.js";
import { AppError } from "./http.js";
import type { AuthUser } from "../modules/auth/types/auth.types.js";
import { validateAccessTokenUseCase } from "../modules/auth/auth.routes.js";

export type AuthenticatedRequest = {
  auth: AuthUser;
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const token = bearerToken(req);
  if (!token) {
    next(new AppError(401, "Token de acesso ausente", "UNAUTHORIZED"));
    return;
  }

  const auth = await validateAccessTokenUseCase.execute(token);
  if (!auth) {
    next(new AppError(401, "Token de acesso inválido ou expirado", "UNAUTHORIZED"));
    return;
  }

  (req as typeof req & AuthenticatedRequest).auth = auth.user;
  next();
};
