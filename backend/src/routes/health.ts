import { Router } from "express";
import { env } from "../config/env";
import { ensureProductionSchema, verifyWatchSchema } from "../lib/ensureSchema";
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

healthRouter.get("/schema", async (_req, res) => {
  try {
    await ensureProductionSchema();
    await prisma.room.findFirst({
      where: { isCommunityBacking: false },
      select: { id: true },
    });
    await verifyWatchSchema();

    res.json({ status: "ok", schema: "compatible" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    console.error("Schema health check failed:", message);
    res.status(503).json({
      status: "error",
      schema: "incompatible",
      message,
      hint: "Production veritabanında prisma migrate deploy çalıştırılmalı.",
    });
  }
});

healthRouter.get("/integrations", (_req, res) => {
  const livekitConfigured = Boolean(
    env.livekitUrl && env.livekitApiKey && env.livekitApiSecret,
  );
  const emailConfigured = Boolean(env.resendApiKey && env.emailFrom);
  const stripeConfigured = Boolean(
    env.stripeSecretKey && env.stripeWebhookSecret,
  );

  res.json({
    status: "ok",
    integrations: {
      livekit: {
        configured: livekitConfigured,
        hint: livekitConfigured
          ? null
          : "Render env: LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET",
      },
      email: {
        configured: emailConfigured,
        provider: env.emailProvider,
        hint: emailConfigured
          ? null
          : "Render env: RESEND_API_KEY, EMAIL_FROM, APP_URL",
      },
      stripe: {
        configured: stripeConfigured,
        hint: stripeConfigured ? null : "Premium için Stripe env gerekli",
      },
      redis: {
        enabled: env.enableRedis,
        configured: !env.enableRedis || Boolean(env.redisUrl),
      },
    },
  });
});
