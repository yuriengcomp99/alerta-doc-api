import { AppError } from "../../../middleware/http.js";

export function parseExpiresAt(value: unknown): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const raw = String(value).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new AppError(
      400,
      "expiresAt deve ser uma data no formato YYYY-MM-DD",
      "INVALID_EXPIRES_AT",
    );
  }

  const date = new Date(`${raw}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, "expiresAt inválido", "INVALID_EXPIRES_AT");
  }

  return date;
}

export function formatExpiresAt(date: Date | null): string | null {
  if (!date) return null;
  return date.toISOString().slice(0, 10);
}
