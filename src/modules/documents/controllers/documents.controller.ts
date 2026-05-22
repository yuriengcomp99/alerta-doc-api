import type { Request, Response } from "express";
import { formField, getDocumentFile } from "../../../lib/upload.js";
import { AppError } from "../../../middleware/http.js";
import type { AuthenticatedRequest } from "../../../middleware/require-auth.js";
import type { DocumentsService } from "../documents.service.js";

type DocRequest = Request & Partial<AuthenticatedRequest>;

function paramId(req: Request): string {
  const id = req.params.id;
  return (Array.isArray(id) ? id[0] : id) ?? "";
}

export class DocumentsController {
  constructor(private readonly documents: DocumentsService) {}

  private ownerId(req: DocRequest): string {
    if (!req.auth) {
      throw new AppError(401, "Não autenticado", "UNAUTHORIZED");
    }
    return req.auth.id;
  }

  async create(req: DocRequest, res: Response) {
    const file = getDocumentFile(req);
    if (!file) {
      throw new AppError(400, "Arquivo é obrigatório", "FILE_REQUIRED");
    }

    const document = await this.documents.create({
      title: formField(req.body, "title") ?? "",
      description: formField(req.body, "description"),
      expiresAt: formField(req.body, "expiresAt"),
      ownerId: this.ownerId(req),
      storedFilename: file.filename,
    });

    res.status(201).json({ document });
  }

  async list(req: DocRequest, res: Response) {
    const documents = await this.documents.list(this.ownerId(req));
    res.json({ documents });
  }

  async getById(req: DocRequest, res: Response) {
    const document = await this.documents.getById(paramId(req), this.ownerId(req));
    res.json({ document });
  }

  async update(req: DocRequest, res: Response) {
    const body = req.body as Record<string, unknown> | undefined;
    const document = await this.documents.update(paramId(req), this.ownerId(req), {
      title: body && "title" in body ? formField(body, "title") : undefined,
      description:
        body && "description" in body ? formField(body, "description") : undefined,
      status: body && "status" in body ? formField(body, "status") : undefined,
      expiresAt: body && "expiresAt" in body ? formField(body, "expiresAt") : undefined,
      storedFilename: getDocumentFile(req)?.filename,
    });

    res.json({ document });
  }

  async remove(req: DocRequest, res: Response) {
    await this.documents.remove(paramId(req), this.ownerId(req));
    res.status(204).send();
  }
}
