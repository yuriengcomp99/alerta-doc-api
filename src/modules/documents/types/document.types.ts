export type DocumentStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export type DocumentDto = {
  id: string;
  title: string;
  description: string | null;
  status: DocumentStatus;
  fileUrl: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDocumentInput = {
  title: string;
  description?: string;
  ownerId: string;
  fileUrl: string;
};

export type UpdateDocumentInput = {
  title?: string;
  description?: string | null;
  status?: DocumentStatus;
  filePath?: string;
  fileUrl?: string;
};
