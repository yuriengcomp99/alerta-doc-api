import { prisma } from "../../../lib/prisma.js";
import type { DocumentRecord } from "../mappers/document.mapper.js";
import type { CreateDocumentInput, UpdateDocumentInput } from "../types/document.types.js";
import type { IDocumentRepository } from "./document.repository.js";

const documentRecordSelect = {
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

export class PrismaDocumentRepository implements IDocumentRepository {
  async create(data: CreateDocumentInput): Promise<DocumentRecord> {
    return prisma.document.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        ownerId: data.ownerId,
        fileUrl: data.fileUrl,
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
      },
      select: documentRecordSelect,
    });
  }

  async findById(id: string): Promise<DocumentRecord | null> {
    return prisma.document.findUnique({
      where: { id },
      select: documentRecordSelect,
    });
  }

  async findByOwner(ownerId: string): Promise<DocumentRecord[]> {
    return prisma.document.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
      select: documentRecordSelect,
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
        ...(data.expiresAt !== undefined ? { expiresAt: data.expiresAt } : {}),
      },
      select: documentRecordSelect,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.document.delete({ where: { id } });
  }
}
