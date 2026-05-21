import { prisma } from "../../../lib/prisma.js";
import type { DocumentRecord } from "../mappers/document.mapper.js";
import type { CreateDocumentInput, UpdateDocumentInput } from "../types/document.types.js";
import type { IDocumentRepository } from "./document.repository.js";

export class PrismaDocumentRepository implements IDocumentRepository {
  async create(data: CreateDocumentInput): Promise<DocumentRecord> {
    return prisma.document.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        ownerId: data.ownerId,
        fileUrl: data.fileUrl,
      },
    });
  }

  async findById(id: string): Promise<DocumentRecord | null> {
    return prisma.document.findUnique({ where: { id } });
  }

  async findByOwner(ownerId: string): Promise<DocumentRecord[]> {
    return prisma.document.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async update(id: string, data: UpdateDocumentInput): Promise<DocumentRecord> {
    return prisma.document.update({
      where: { id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.fileUrl !== undefined ? { fileUrl: data.fileUrl } : {}),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.document.delete({ where: { id } });
  }
}
