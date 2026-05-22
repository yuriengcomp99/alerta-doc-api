import { prisma } from "../../../lib/prisma.js";
import type { DocumentRecord } from "../document.mapper.js";
import type { CreateDocumentInput, UpdateDocumentInput } from "../types/document.types.js";

const select = {
  id: true,
  title: true,
  description: true,
  status: true,
  fileUrl: true,
  expiresAt: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class PrismaDocumentRepository {
  create(data: CreateDocumentInput): Promise<DocumentRecord> {
    return prisma.document.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        ownerId: data.ownerId,
        fileUrl: data.fileUrl,
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
      },
      select,
    });
  }

  findById(id: string): Promise<DocumentRecord | null> {
    return prisma.document.findUnique({ where: { id }, select });
  }

  findByOwner(ownerId: string): Promise<DocumentRecord[]> {
    return prisma.document.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select,
    });
  }

  update(id: string, data: UpdateDocumentInput): Promise<DocumentRecord> {
    return prisma.document.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl } : {}),
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
      },
      select,
    });
  }

  delete(id: string): Promise<void> {
    return prisma.document.delete({ where: { id } }).then(() => undefined);
  }
}
