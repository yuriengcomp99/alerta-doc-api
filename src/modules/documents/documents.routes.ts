import { Router, type RequestHandler } from "express";
import { handleMulter } from "../../lib/multer-handler.js";
import { uploadDocument } from "../../lib/upload.js";
import { asyncHandler } from "../../middleware/http.js";
import { requireAuth } from "../../middleware/require-auth.js";
import type { DocumentsController } from "./controllers/documents.controller.js";
import { makeDocumentsModule } from "./factories/documents.factory.js";

type DocReq = Parameters<DocumentsController["create"]>[0];

const { controller } = makeDocumentsModule();
const upload = handleMulter(uploadDocument.single("file"));
const uploadOptional = handleMulter(uploadDocument.single("file"));

const multipartIfNeeded: RequestHandler = (req, res, next) => {
  if (req.is("multipart/form-data")) {
    uploadOptional(req, res, next);
    return;
  }
  next();
};

export function documentsRoutes() {
  const router = Router();

  router.use(requireAuth);

  router.post(
    "/",
    upload,
    asyncHandler((req, res) => controller.create(req as DocReq, res)),
  );

  router.get("/", asyncHandler((req, res) => controller.list(req as DocReq, res)));

  router.get(
    "/:id",
    asyncHandler((req, res) => controller.getById(req as DocReq, res)),
  );

  router.patch(
    "/:id",
    multipartIfNeeded,
    asyncHandler((req, res) => controller.update(req as DocReq, res)),
  );

  router.delete(
    "/:id",
    asyncHandler((req, res) => controller.remove(req as DocReq, res)),
  );

  return router;
}
