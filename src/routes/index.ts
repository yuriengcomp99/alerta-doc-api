import type { Express } from "express";
import { authRoutes } from "../modules/auth/auth.routes.js";
import { documentsRoutes } from "../modules/documents/documents.routes.js";
import { healthRouter } from "./health.routes.js";

export function registerRoutes(app: Express) {
  app.use("/health", healthRouter);
  app.use("/api/auth", authRoutes());
  app.use("/api/documents", documentsRoutes());
}
