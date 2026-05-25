import { resolveApiPublicUrl } from "../config/env.js";
import { openApiDefinition } from "./openapi.js";

export function buildOpenApiSpec() {
  const apiPublicUrl = resolveApiPublicUrl();

  return {
    ...JSON.parse(JSON.stringify(openApiDefinition)),
    servers: [
      {
        url: apiPublicUrl,
        description: process.env.API_PUBLIC_URL?.trim()
          ? "API (API_PUBLIC_URL)"
          : "API (fallback localhost + PORT)",
      },
    ],
  };
}
