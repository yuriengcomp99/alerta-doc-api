import { AuthController } from "../controllers/auth.controller.js";
import { PrismaAuthSessionRepository } from "../repositories/prisma-auth-session.repository.js";
import { PrismaUserRepository } from "../repositories/prisma-user.repository.js";
import { IssueTokensUseCase } from "../use-cases/issue-tokens.use-case.js";
import { LoginUseCase } from "../use-cases/login.use-case.js";
import { LogoutUseCase } from "../use-cases/logout.use-case.js";
import { RefreshTokensUseCase } from "../use-cases/refresh-tokens.use-case.js";
import { RegisterUseCase } from "../use-cases/register.use-case.js";
import { ValidateAccessTokenUseCase } from "../use-cases/validate-access-token.use-case.js";

export function makeAuthModule() {
  const userRepository = new PrismaUserRepository();
  const sessionRepository = new PrismaAuthSessionRepository();

  const issueTokensUseCase = new IssueTokensUseCase(sessionRepository);
  const validateAccessTokenUseCase = new ValidateAccessTokenUseCase(
    sessionRepository,
  );

  const controller = new AuthController(
    new RegisterUseCase(userRepository, issueTokensUseCase),
    new LoginUseCase(userRepository, issueTokensUseCase),
    new RefreshTokensUseCase(sessionRepository, issueTokensUseCase),
    new LogoutUseCase(sessionRepository),
    validateAccessTokenUseCase,
  );

  return { controller, validateAccessTokenUseCase };
}
