import { Router, type RequestHandler } from "express";
import { handleMultipart, parseDocumentMultipart } from "../../lib/upload.js";
import { asyncHandler } from "../../middleware/http.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { DocumentsController } from "./controllers/documents.controller.js";
import { DocumentsService } from "./documents.service.js";

const controller = new DocumentsController(new DocumentsService());
const upload = handleMultipart(parseDocumentMultipart);

const multipartIfNeeded: RequestHandler = (req, res, next) => {
  if (req.is("multipart/form-data")) {
    upload(req, res, next);
    return;
  }
  next();
};

export function documentsRoutes() {
  const router = Router();
  router.use(requireAuth);

  router.post("/", upload, asyncHandler((req, res) => controller.create(req, res)));
  router.get("/", asyncHandler((req, res) => controller.list(req, res)));
  router.get("/:id", asyncHandler((req, res) => controller.getById(req, res)));
  router.patch(
    "/:id",
    multipartIfNeeded,
    asyncHandler((req, res) => controller.update(req, res)),
  );
  router.delete("/:id", asyncHandler((req, res) => controller.remove(req, res)));

  return router;
}
