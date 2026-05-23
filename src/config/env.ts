import path from "node:path";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? "uploads"),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 10),
};
