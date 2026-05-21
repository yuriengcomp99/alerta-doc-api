import { Router } from "express";
import { env } from "../../config/env.js";
import { bearerToken } from "../../middleware/auth.js";
import { AppError, asyncHandler } from "../../middleware/http.js";
import type { AuthRequest } from "./types/auth.types.js";
import { makeAuthModule } from "./factories/auth.factory.js";

const { controller, validateAccessTokenUseCase } = makeAuthModule();

export { validateAccessTokenUseCase };

export function authRoutes() {
  const router = Router();

  router.post("/register", asyncHandler((req, res) => controller.register(req, res)));
  router.post("/login", asyncHandler((req, res) => controller.login(req, res)));
  router.post("/refresh", asyncHandler((req, res) => controller.refresh(req, res)));
  router.post("/logout", asyncHandler((req, res) => controller.logout(req, res)));

  router.get(
    "/me",
    asyncHandler(async (req, res, next) => {
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

      (req as AuthRequest).auth = auth.user;
      controller.me(req as AuthRequest, res);
    }),
  );

  router.post(
    "/introspect",
    (req, _res, next) => {
      if (req.headers["x-api-key"] !== env.introspectApiKey) {
        next(new AppError(401, "API key inválida", "INVALID_API_KEY"));
        return;
      }
      next();
    },
    asyncHandler((req, res) => controller.introspect(req, res)),
  );

  return router;
}
