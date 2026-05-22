import { AppError } from "../../middleware/http.js";
import type { DocumentDto, DocumentStatus } from "./types/document.types.js";

export type DocumentRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  fileUrl: string | null;
  expiresAt: Date | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

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

export function toDocumentDto(record: DocumentRecord): DocumentDto {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    status: record.status as DocumentStatus,
    fileUrl: record.fileUrl,
    expiresAt: record.expiresAt ? record.expiresAt.toISOString().slice(0, 10) : null,
    ownerId: record.ownerId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
