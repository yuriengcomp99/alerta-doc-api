import type { Express, RequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import { buildOpenApiSpec } from "./build-openapi-spec.js";

const swaggerSetup = swaggerUi.setup(undefined, {
  customSiteTitle: "Alerta Doc API",
  swaggerOptions: {
    url: "/docs/openapi.json",
    persistAuthorization: true,
  },
}) as RequestHandler;

export function registerSwagger(app: Express): void {
  app.get("/docs/openapi.json", (_req, res) => {
    res.json(buildOpenApiSpec());
  });
  app.use("/docs", ...swaggerUi.serve, swaggerSetup);
}
