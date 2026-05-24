import { createClient, type RedisClientType } from "redis";
import { env } from "../config/env";

let redisClient: RedisClientType | null = null;
let connectPromise: Promise<RedisClientType | null> | null = null;

export function isRedisEnabled(): boolean {
  return env.enableRedis;
}

export function createRedisClient(): RedisClientType {
  return createClient({
    url: env.redisUrl,
  });
}

export function getRedisClient(): RedisClientType | null {
  return redisClient;
}

export async function connectRedis(): Promise<RedisClientType | null> {
  if (!isRedisEnabled()) {
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (connectPromise) {
    return connectPromise;
  }

  connectPromise = (async () => {
    const client = createRedisClient();

    client.on("error", (error) => {
      if (env.isDevelopment) {
        console.warn("Redis istemci hatası:", error.message);
      } else {
        console.error("Redis istemci hatası:", error.message);
      }
    });

    try {
      await client.connect();
      redisClient = client;

      if (env.isDevelopment) {
        console.log("Redis bağlantısı kuruldu");
      }

      return client;
    } catch (error) {
      redisClient = null;

      const message =
        error instanceof Error ? error.message : "Bilinmeyen Redis hatası";

      if (env.isDevelopment) {
        console.warn(
          `Redis bağlantısı kurulamadı (${message}). In-memory fallback kullanılacak.`,
        );
      } else {
        console.error(`Redis bağlantısı kurulamadı: ${message}`);
      }

      return null;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient?.isOpen) {
    redisClient = null;
    return;
  }

  await redisClient.quit();
  redisClient = null;
}
