import type { Server as HttpServer } from "http";
import type { Server } from "socket.io";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { getAllowedOrigins } from "../config/cors";
import { env } from "../config/env";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../lib/prisma";
import { connectRedis, isRedisEnabled } from "../lib/redis";
import { toSocketUser } from "../utils/sanitizeMessage";
import { registerPresenceHandlers } from "./presence.socket";
import { registerNotificationHandlers } from "./notification.socket";
import { registerChatHandlers } from "./chat.socket";
import { registerDmHandlers } from "./dm.socket";
import { registerWatchHandlers } from "./watch.socket";

let ioInstance: Server | null = null;

async function attachRedisAdapter(io: Server): Promise<void> {
  if (!isRedisEnabled()) {
    return;
  }

  const pubClient = await connectRedis();

  if (!pubClient?.isOpen) {
    if (env.isDevelopment) {
      console.warn(
        "Redis etkin ancak bağlantı kurulamadı. Socket.IO tek instance modunda çalışacak.",
      );
    }
    return;
  }

  try {
    const subClient = pubClient.duplicate();
    await subClient.connect();
    io.adapter(createAdapter(pubClient, subClient));

    if (env.isDevelopment) {
      console.log("Socket.IO Redis adapter aktif");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";

    if (env.isDevelopment) {
      console.warn(
        `Socket.IO Redis adapter kurulamadı (${message}). Tek instance modunda devam ediliyor.`,
      );
    } else {
      console.error(`Socket.IO Redis adapter kurulamadı: ${message}`);
    }
  }
}

export async function setupSocket(httpServer: HttpServer): Promise<Server> {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  await attachRedisAdapter(io);

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token || typeof token !== "string") {
        next(new Error("Yetkilendirme gerekli"));
        return;
      }

      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        next(new Error("Kullanıcı bulunamadı"));
        return;
      }

      socket.data.userId = user.id;
      socket.data.user = toSocketUser(user);
      next();
    } catch {
      next(new Error("Geçersiz token"));
    }
  });

  registerPresenceHandlers(io);
  registerChatHandlers(io);
  registerDmHandlers(io);
  registerWatchHandlers(io);
  registerNotificationHandlers(io);

  ioInstance = io;
  return io;
}

export function getIO(): Server | null {
  return ioInstance;
}
