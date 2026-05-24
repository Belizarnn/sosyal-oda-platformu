import { createServer } from "http";
import { app } from "./app";
import { env } from "./config/env";
import { disconnectRedis } from "./lib/redis";
import { setupSocket } from "./socket";

async function startServer(): Promise<void> {
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
