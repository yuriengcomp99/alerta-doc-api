import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../../../config/env.js";
import { ensureUploadDir } from "../../../lib/upload.js";

export class FileStorageService {
  buildPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  resolvePath(filename: string): string {
    return path.join(env.uploadDir, filename);
  }

  filenameFromUrl(fileUrl: string | null): string | null {
    if (!fileUrl?.startsWith("/uploads/")) return null;
    return path.basename(fileUrl);
  }

  async removeByUrl(fileUrl: string | null): Promise<void> {
    const filename = this.filenameFromUrl(fileUrl);
    if (!filename) return;

    try {
      await fs.unlink(this.resolvePath(filename));
    } catch {
      // arquivo já removido ou inexistente
    }
  }

  async init(): Promise<void> {
    ensureUploadDir();
  }
}
