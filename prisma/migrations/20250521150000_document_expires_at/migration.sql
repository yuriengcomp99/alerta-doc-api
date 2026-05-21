-- AlterTable
ALTER TABLE "documents" ADD COLUMN "expires_at" DATE;

-- CreateIndex
CREATE INDEX "documents_expires_at_idx" ON "documents"("expires_at");
