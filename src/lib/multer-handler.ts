import type { RequestHandler } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { AppError } from "../middleware/http.js";

export function handleMulter(upload: RequestHandler): RequestHandler {
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (!err) {
        next();
        return;
      }

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          next(
            new AppError(
              400,
              `Arquivo excede o limite de ${env.maxFileSizeMb}MB`,
              "FILE_TOO_LARGE",
            ),
          );
          return;
        }
        next(new AppError(400, err.message, "UPLOAD_ERROR"));
        return;
      }

      next(err);
    });
  };
}
