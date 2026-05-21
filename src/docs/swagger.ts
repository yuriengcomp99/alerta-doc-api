import type { Express, RequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi.js";

const swaggerDocument = JSON.parse(JSON.stringify(openApiSpec));

const swaggerSetup = swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "Alerta Doc API",
  swaggerOptions: {
    persistAuthorization: true,
  },
}) as RequestHandler;

export function registerSwagger(app: Express): void {
  app.get("/docs/openapi.json", (_req, res) => {
    res.json(swaggerDocument);
  });
  app.use("/docs", ...swaggerUi.serve, swaggerSetup);
}
