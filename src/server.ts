import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { ensureUploadDir } from "./lib/upload.js";
import { prisma } from "./lib/prisma.js";
import { errorHandler, notFound } from "./middleware/http.js";
import { registerSwagger } from "./docs/swagger.js";
import { registerRoutes } from "./routes/index.js";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL não configurada");
}

ensureUploadDir();

const app = createApp();
registerSwagger(app);
registerRoutes(app);
app.use(notFound);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`[api] porta ${env.port}`);
  console.log(`[api] swagger ${env.apiPublicUrl}/docs`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
