import { Router } from "express";
import { env } from "../config/env";
import { prisma } from "../lib/prisma";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    environment: env.nodeEnv,
    message: "Sosyal Oda Platformu API is running",
  });
});

healthRouter.get("/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("Database health check failed:", message);
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message,
    });
  }
});
