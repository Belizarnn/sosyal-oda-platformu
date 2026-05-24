import { execSync } from "node:child_process";
import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { disconnectRedis } from "./lib/redis";
import { setupSocket } from "./socket";

function runProductionMigrations(): void {
  if (env.nodeEnv !== "production") {
    return;
  }

  console.log("Production migration kontrolü başlatılıyor...");
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("Migration kontrolü tamamlandı.");
}

async function startServer(): Promise<void> {
  runProductionMigrations();

  const httpServer = createServer(app);

  await setupSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(
      `API ${env.nodeEnv} modunda port ${env.port} üzerinde çalışıyor`,
    );
  });

  const shutdown = async () => {
    await disconnectRedis();
    httpServer.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });
}

void startServer().catch((error) => {
  console.error("Sunucu başlatılamadı:", error);
  process.exit(1);
});
