import { AppError } from "../../../middleware/http.js";
import { toDocumentDto } from "../mappers/document.mapper.js";
import type { IDocumentRepository } from "../repositories/document.repository.js";
import type { FileStorageService } from "../services/file-storage.service.js";
import type { DocumentDto } from "../types/document.types.js";

export class CreateDocumentUseCase {
  constructor(
    private readonly documents: IDocumentRepository,
    private readonly storage: FileStorageService,
  ) {}

  async execute(input: {
    title: string;
    description?: string;
    ownerId: string;
    storedFilename: string;
  }): Promise<DocumentDto> {
    const title = input.title.trim();
    if (!title) {
      throw new AppError(400, "Título é obrigatório", "INVALID_TITLE");
    }

    const fileUrl = this.storage.buildPublicUrl(input.storedFilename);

    const document = await this.documents.create({
      title,
      description: input.description?.trim() || undefined,
      ownerId: input.ownerId,
      fileUrl,
    });

    return toDocumentDto(document);
  }
}
