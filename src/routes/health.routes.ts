import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  let database = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = "error";
  }

  res.json({
    status: database === "ok" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    services: { database },
  });
});
