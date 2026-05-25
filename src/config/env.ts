import path from "node:path";

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/** URL pública da API (Swagger, Try it out). Defina `API_PUBLIC_URL` no deploy. */
export function resolveApiPublicUrl(): string {
  const fromEnv = process.env.API_PUBLIC_URL?.trim();
  if (fromEnv) {
    return normalizeBaseUrl(fromEnv);
  }
  const port = Number(process.env.PORT ?? 3000);
  return `http://localhost:${port}`;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  apiPublicUrl: resolveApiPublicUrl(),
  databaseUrl: process.env.DATABASE_URL ?? "",
  accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? "uploads"),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 10),
};
