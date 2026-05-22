import { buildUploadUrl, removeUploadByUrl } from "../../lib/upload.js";
import { AppError } from "../../middleware/http.js";
import { parseExpiresAt, toDocumentDto } from "./document.mapper.js";
import { PrismaDocumentRepository } from "./repositories/prisma-document.repository.js";
import type { DocumentDto, DocumentStatus } from "./types/document.types.js";

const STATUSES: DocumentStatus[] = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];

export class DocumentsService {
  private readonly repo = new PrismaDocumentRepository();

  async create(input: {
    title: string;
    description?: string;
    expiresAt?: unknown;
    ownerId: string;
    storedFilename: string;
  }): Promise<DocumentDto> {
    const title = input.title.trim();
    if (!title) {
      throw new AppError(400, "Título é obrigatório", "INVALID_TITLE");
    }

    const row = await this.repo.create({
      title,
      description: input.description?.trim() || undefined,
      ownerId: input.ownerId,
      fileUrl: buildUploadUrl(input.storedFilename),
      expiresAt: parseExpiresAt(input.expiresAt) ?? null,
    });

    return toDocumentDto(row);
  }

  async list(ownerId: string): Promise<DocumentDto[]> {
    const rows = await this.repo.findByOwner(ownerId);
    return rows.map(toDocumentDto);
  }

  async getById(id: string, ownerId: string): Promise<DocumentDto> {
    const row = await this.requireOwned(id, ownerId);
    return toDocumentDto(row);
  }

  async update(
    id: string,
    ownerId: string,
    input: {
      title?: string;
      description?: string | null;
      status?: string;
      expiresAt?: unknown;
      storedFilename?: string;
    },
  ): Promise<DocumentDto> {
    const existing = await this.requireOwned(id, ownerId);
    const data: {
      title?: string;
      description?: string | null;
      status?: DocumentStatus;
      fileUrl?: string;
      expiresAt?: Date | null;
    } = {};

    if (input.title !== undefined) {
      const title = input.title.trim();
      if (!title) {
        throw new AppError(400, "Título é obrigatório", "INVALID_TITLE");
      }
      data.title = title;
    }

    if (input.description !== undefined) {
      data.description = input.description?.trim() || null;
    }

    if (input.status !== undefined) {
      if (!STATUSES.includes(input.status as DocumentStatus)) {
        throw new AppError(400, "Status inválido", "INVALID_STATUS");
      }
      data.status = input.status as DocumentStatus;
    }

    if (input.expiresAt !== undefined) {
      data.expiresAt = parseExpiresAt(input.expiresAt) ?? null;
    }

    if (input.storedFilename) {
      await removeUploadByUrl(existing.fileUrl);
      data.fileUrl = buildUploadUrl(input.storedFilename);
    }

    const row = await this.repo.update(id, data);
    return toDocumentDto(row);
  }

  async remove(id: string, ownerId: string): Promise<void> {
    const existing = await this.requireOwned(id, ownerId);
    await removeUploadByUrl(existing.fileUrl);
    await this.repo.delete(id);
  }

  private async requireOwned(id: string, ownerId: string) {
    const row = await this.repo.findById(id);
    if (!row || row.ownerId !== ownerId) {
      throw new AppError(404, "Documento não encontrado", "DOCUMENT_NOT_FOUND");
    }
    return row;
  }
}
