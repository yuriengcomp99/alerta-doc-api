import type { CreateDocumentInput, UpdateDocumentInput } from "../types/document.types.js";
import type { DocumentRecord } from "../mappers/document.mapper.js";

export interface IDocumentRepository {
  create(data: CreateDocumentInput): Promise<DocumentRecord>;
  findById(id: string): Promise<DocumentRecord | null>;
  findByOwner(ownerId: string): Promise<DocumentRecord[]>;
  update(id: string, data: UpdateDocumentInput): Promise<DocumentRecord>;
  delete(id: string): Promise<void>;
}
