import { AppError } from "../../../middleware/http.js";
import { toDocumentDto } from "../mappers/document.mapper.js";
import type { IDocumentRepository } from "../repositories/document.repository.js";
import type { DocumentDto } from "../types/document.types.js";

export class GetDocumentUseCase {
  constructor(private readonly documents: IDocumentRepository) {}

  async execute(id: string, ownerId: string): Promise<DocumentDto> {
    const document = await this.documents.findById(id);

    if (!document || document.ownerId !== ownerId) {
      throw new AppError(404, "Documento não encontrado", "DOCUMENT_NOT_FOUND");
    }

    return toDocumentDto(document);
  }
}
