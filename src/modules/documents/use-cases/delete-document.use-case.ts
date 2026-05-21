import { AppError } from "../../../middleware/http.js";
import type { IDocumentRepository } from "../repositories/document.repository.js";
import type { FileStorageService } from "../services/file-storage.service.js";

export class DeleteDocumentUseCase {
  constructor(
    private readonly documents: IDocumentRepository,
    private readonly storage: FileStorageService,
  ) {}

  async execute(id: string, ownerId: string): Promise<void> {
    const existing = await this.documents.findById(id);

    if (!existing || existing.ownerId !== ownerId) {
      throw new AppError(404, "Documento não encontrado", "DOCUMENT_NOT_FOUND");
    }

    await this.storage.removeByUrl(existing.fileUrl);
    await this.documents.delete(id);
  }
}
