import type { Request, Response } from "express";
import { AppError } from "../../../middleware/http.js";
import type { AuthenticatedRequest } from "../../../middleware/require-auth.js";
import type { CreateDocumentUseCase } from "../use-cases/create-document.use-case.js";
import type { DeleteDocumentUseCase } from "../use-cases/delete-document.use-case.js";
import type { GetDocumentUseCase } from "../use-cases/get-document.use-case.js";
import type { ListDocumentsUseCase } from "../use-cases/list-documents.use-case.js";
import type { UpdateDocumentUseCase } from "../use-cases/update-document.use-case.js";

type DocRequest = Request & Partial<AuthenticatedRequest> & {
  file?: Express.Multer.File;
};

function paramId(req: Request): string {
  const id = req.params.id;
  return (Array.isArray(id) ? id[0] : id) ?? "";
}

export class DocumentsController {
  constructor(
    private readonly createDocument: CreateDocumentUseCase,
    private readonly listDocuments: ListDocumentsUseCase,
    private readonly getDocument: GetDocumentUseCase,
    private readonly updateDocument: UpdateDocumentUseCase,
    private readonly deleteDocument: DeleteDocumentUseCase,
  ) {}

  private getAuth(req: DocRequest) {
    if (!req.auth) {
      throw new AppError(401, "Não autenticado", "UNAUTHORIZED");
    }
    return req.auth;
  }

  async create(req: DocRequest, res: Response) {
    if (!req.file) {
      throw new AppError(400, "Arquivo é obrigatório", "FILE_REQUIRED");
    }

    const document = await this.createDocument.execute({
      title: String(req.body?.title ?? ""),
      description:
        typeof req.body?.description === "string"
          ? req.body.description
          : undefined,
      ownerId: this.getAuth(req).id,
      storedFilename: req.file.filename,
    });

    res.status(201).json({ document });
  }

  async list(req: DocRequest, res: Response) {
    const documents = await this.listDocuments.execute(this.getAuth(req).id);
    res.json({ documents });
  }

  async getById(req: DocRequest, res: Response) {
    const document = await this.getDocument.execute(
      paramId(req),
      this.getAuth(req).id,
    );
    res.json({ document });
  }

  async update(req: DocRequest, res: Response) {
    const document = await this.updateDocument.execute(
      paramId(req),
      this.getAuth(req).id,
      {
        title:
          req.body?.title !== undefined ? String(req.body.title) : undefined,
        description:
          req.body?.description !== undefined
            ? String(req.body.description)
            : undefined,
        status:
          req.body?.status !== undefined ? String(req.body.status) : undefined,
        storedFilename: req.file?.filename,
      },
    );

    res.json({ document });
  }

  async remove(req: DocRequest, res: Response) {
    await this.deleteDocument.execute(paramId(req), this.getAuth(req).id);
    res.status(204).send();
  }
}
