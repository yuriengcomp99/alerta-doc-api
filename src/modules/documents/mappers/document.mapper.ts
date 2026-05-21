import type { DocumentDto, DocumentStatus } from "../types/document.types.js";
import { formatExpiresAt } from "../utils/parse-expires-at.js";

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

export function toDocumentDto(record: DocumentRecord): DocumentDto {
  return {
    id: record.id,
    title: record.title,
    description: record.description,
    status: record.status as DocumentStatus,
    fileUrl: record.fileUrl,
    expiresAt: formatExpiresAt(record.expiresAt),
    ownerId: record.ownerId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
