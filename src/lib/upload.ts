import fs from "node:fs";
import fsPromises from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { Request, RequestHandler } from "express";
import appendField from "append-field";
import Busboy from "busboy";
import is from "type-is";
import { env } from "../config/env.js";
import { AppError } from "../middleware/http.js";

export type UploadedFile = {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  filename: string;
  path: string;
  size: number;
};

type MultipartRequest = Request & {
  body: Record<string, unknown>;
  uploadedFiles?: UploadedFile[];
};

const TEXT_FIELDS = new Set(["title", "description", "expiresAt", "status"]);

const ALLOWED_EXT = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".doc",
  ".docx",
]);

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/x-pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function isAllowedUpload(
  originalname: string,
  mimetype: string | undefined,
): boolean {
  const ext = path.extname(originalname).toLowerCase();
  if (ext && ALLOWED_EXT.has(ext)) return true;
  if (mimetype && ALLOWED_MIME.has(mimetype)) return true;
  if (mimetype === "application/octet-stream" && ext === ".pdf") return true;
  return false;
}

export function ensureUploadDir(): void {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

export function buildUploadUrl(filename: string): string {
  return `/uploads/${filename}`;
}

export async function removeUploadByUrl(fileUrl: string | null): Promise<void> {
  if (!fileUrl?.startsWith("/uploads/")) return;
  const filePath = path.join(env.uploadDir, path.basename(fileUrl));
  try {
    await fsPromises.unlink(filePath);
  } catch {
    /* ignore */
  }
}

export function formField(body: unknown, key: string): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;
  const raw =
    record[key] ??
    Object.entries(record).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1];
  if (raw === undefined || raw === null) return undefined;
  const value = Array.isArray(raw) ? raw.at(-1) : raw;
  const text = String(value).trim();
  return text || undefined;
}

export function getDocumentFile(req: Request): UploadedFile | undefined {
  return (req as MultipartRequest).uploadedFiles?.find(
    (part) => part.fieldname === "file",
  );
}

async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

export const parseDocumentMultipart: RequestHandler = (req, res, next) => {
  if (!is(req, ["multipart"])) {
    next();
    return;
  }

  req.body = {};
  const files: UploadedFile[] = [];
  let pending = 0;
  let finished = false;

  const done = (err?: unknown) => {
    if (err) {
      next(err);
      return;
    }
    if (finished && pending === 0) {
      (req as MultipartRequest).uploadedFiles = files;
      next();
    }
  };

  const busboy = Busboy({
    headers: req.headers,
    limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
    defParamCharset: "utf8",
  });

  busboy.on("field", (name, value) => {
    const text = String(value).trim();
    if (text) appendField(req.body, name, text);
  });

  busboy.on("file", (name, stream, info) => {
    pending++;

    void (async () => {
      try {
        if (TEXT_FIELDS.has(name)) {
          const text = (await readStream(stream)).trim();
          if (text) appendField(req.body, name, text);
          return;
        }

        if (!info.filename) {
          stream.resume();
          return;
        }

        if (name !== "file") {
          stream.resume();
          return;
        }

        if (!isAllowedUpload(info.filename, info.mimeType)) {
          throw new AppError(
            400,
            "Tipo de arquivo não permitido. Use PDF, imagem ou DOC/DOCX.",
            "INVALID_FILE_TYPE",
          );
        }

        ensureUploadDir();
        const ext = path.extname(info.filename) || "";
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
        const filePath = path.join(env.uploadDir, filename);

        await pipeline(stream, fs.createWriteStream(filePath));
        const stat = await fsPromises.stat(filePath);

        files.push({
          fieldname: "file",
          originalname: info.filename,
          encoding: info.encoding,
          mimetype: info.mimeType,
          filename,
          path: filePath,
          size: stat.size,
        });
      } catch (err) {
        done(err);
      } finally {
        pending--;
        done();
      }
    })();
  });

  busboy.on("finish", () => {
    finished = true;
    done();
  });

  busboy.on("error", (err) => done(err));
  req.pipe(busboy);
};

export function handleMultipart(parser: RequestHandler): RequestHandler {
  return (req, res, next) => {
    parser(req, res, (err) => next(err));
  };
}
