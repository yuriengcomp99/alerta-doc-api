import crypto from "node:crypto";

export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

const UNITS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDuration(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());
  if (!match) {
    throw new Error(`Duração inválida: ${value}`);
  }
  const amount = Number(match[1]);
  const unit = UNITS[match[2]];
  return amount * unit;
}

export function expiresAtFromNow(duration: string): Date {
  return new Date(Date.now() + parseDuration(duration));
}
