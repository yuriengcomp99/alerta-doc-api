import { AppError } from "../../../middleware/http.js";
import { toDocumentDto } from "../mappers/document.mapper.js";
import type { IDocumentRepository } from "../repositories/document.repository.js";
import type { FileStorageService } from "../services/file-storage.service.js";
import type { DocumentDto, DocumentStatus } from "../types/document.types.js";

const ALLOWED_STATUS: DocumentStatus[] = [
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
];

export class UpdateDocumentUseCase {
  constructor(
    private readonly documents: IDocumentRepository,
    private readonly storage: FileStorageService,
  ) {}

  async execute(
    id: string,
    ownerId: string,
    input: {
      title?: string;
      description?: string | null;
      status?: string;
      storedFilename?: string;
    },
  ): Promise<DocumentDto> {
    const existing = await this.documents.findById(id);

    if (!existing || existing.ownerId !== ownerId) {
      throw new AppError(404, "Documento não encontrado", "DOCUMENT_NOT_FOUND");
    }

    const data: {
      title?: string;
      description?: string | null;
      status?: DocumentStatus;
      fileUrl?: string;
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
      if (!ALLOWED_STATUS.includes(input.status as DocumentStatus)) {
        throw new AppError(400, "Status inválido", "INVALID_STATUS");
      }
      data.status = input.status as DocumentStatus;
    }

    if (input.storedFilename) {
      await this.storage.removeByUrl(existing.fileUrl);
      data.fileUrl = this.storage.buildPublicUrl(input.storedFilename);
    }

    const updated = await this.documents.update(id, data);
    return toDocumentDto(updated);
  }
}
