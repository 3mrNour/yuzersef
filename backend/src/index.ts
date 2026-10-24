import "dotenv/config";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./db.js";

const port = Number(process.env.PORT ?? 8787);

async function start() {
  await connectDatabase();
  const app = createApp();
  const server = app.listen(port, () => {
    console.log(`Yuzersef API listening on http://localhost:${port}`);
  });

  async function shutdown(signal: string) {
    console.log(`Received ${signal}, closing server.`);
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await disconnectDatabase();
    process.exit(0);
  }

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start().catch((error: unknown) => {
  console.error("Failed to start Yuzersef API", error);
  process.exit(1);
});
