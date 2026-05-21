import { toDocumentDto } from "../mappers/document.mapper.js";
import type { IDocumentRepository } from "../repositories/document.repository.js";
import type { DocumentDto } from "../types/document.types.js";

export class ListDocumentsUseCase {
  constructor(private readonly documents: IDocumentRepository) {}

  async execute(ownerId: string): Promise<DocumentDto[]> {
    const rows = await this.documents.findByOwner(ownerId);
    return rows.map(toDocumentDto);
  }
}
