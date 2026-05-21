import { DocumentsController } from "../controllers/documents.controller.js";
import { PrismaDocumentRepository } from "../repositories/prisma-document.repository.js";
import { FileStorageService } from "../services/file-storage.service.js";
import { CreateDocumentUseCase } from "../use-cases/create-document.use-case.js";
import { DeleteDocumentUseCase } from "../use-cases/delete-document.use-case.js";
import { GetDocumentUseCase } from "../use-cases/get-document.use-case.js";
import { ListDocumentsUseCase } from "../use-cases/list-documents.use-case.js";
import { UpdateDocumentUseCase } from "../use-cases/update-document.use-case.js";

export function makeDocumentsModule() {
  const documentRepository = new PrismaDocumentRepository();
  const storage = new FileStorageService();

  const controller = new DocumentsController(
    new CreateDocumentUseCase(documentRepository, storage),
    new ListDocumentsUseCase(documentRepository),
    new GetDocumentUseCase(documentRepository),
    new UpdateDocumentUseCase(documentRepository, storage),
    new DeleteDocumentUseCase(documentRepository, storage),
  );

  return { controller, storage };
}
