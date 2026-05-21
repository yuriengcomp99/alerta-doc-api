import type { Request, Response } from "express";
import { bearerToken } from "../../../middleware/auth.js";
import { AppError } from "../../../middleware/http.js";
import type { LoginUseCase } from "../use-cases/login.use-case.js";
import type { LogoutUseCase } from "../use-cases/logout.use-case.js";
import type { RefreshTokensUseCase } from "../use-cases/refresh-tokens.use-case.js";
import type { RegisterUseCase } from "../use-cases/register.use-case.js";
import type { ValidateAccessTokenUseCase } from "../use-cases/validate-access-token.use-case.js";
import type { AuthRequest } from "../types/auth.types.js";

export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokensUseCase: RefreshTokensUseCase,
    private readonly logoutUseCase: LogoutUseCase,
    private readonly validateAccessTokenUseCase: ValidateAccessTokenUseCase,
  ) {}

  private credentials(body: unknown) {
    const email =
      typeof (body as { email?: unknown })?.email === "string"
        ? (body as { email: string }).email
        : "";
    const password =
      typeof (body as { password?: unknown })?.password === "string"
        ? (body as { password: string }).password
        : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError(400, "E-mail inválido", "INVALID_EMAIL");
    }
    if (password.length < 8) {
      throw new AppError(
        400,
        "Senha deve ter no mínimo 8 caracteres",
        "INVALID_PASSWORD",
      );
    }

    return { email, password };
  }

  async register(req: Request, res: Response) {
    const { email, password } = this.credentials(req.body);
    const name =
      typeof req.body?.name === "string" ? req.body.name : undefined;
    const result = await this.registerUseCase.execute(email, password, name);
    res.status(201).json(result);
  }

  async login(req: Request, res: Response) {
    const { email, password } = this.credentials(req.body);
    res.json(await this.loginUseCase.execute(email, password));
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.body?.refreshToken;
    if (typeof refreshToken !== "string" || !refreshToken) {
      throw new AppError(400, "refreshToken é obrigatório", "INVALID_REFRESH_TOKEN");
    }
    res.json(await this.refreshTokensUseCase.execute(refreshToken));
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.body?.refreshToken;
    const accessToken = bearerToken(req);

    if (typeof refreshToken === "string" && refreshToken) {
      await this.logoutUseCase.execute(refreshToken);
    } else if (accessToken) {
      await this.logoutUseCase.execute(undefined, accessToken);
    } else {
      throw new AppError(
        400,
        "Informe refreshToken no body ou Bearer token no header",
        "INVALID_LOGOUT_REQUEST",
      );
    }

    res.status(204).send();
  }

  me(req: AuthRequest, res: Response) {
    res.json({ user: req.auth });
  }

  async introspect(req: Request, res: Response) {
    const token = req.body?.token;
    if (typeof token !== "string" || !token) {
      throw new AppError(400, "token é obrigatório", "INVALID_TOKEN");
    }

    const result = await this.validateAccessTokenUseCase.execute(token);
    res.json(
      result
        ? {
            active: true,
            sessionId: result.sessionId,
            user: result.user,
            accessExpiresAt: result.accessExpiresAt,
          }
        : { active: false },
    );
  }
}
