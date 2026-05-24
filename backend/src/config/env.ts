import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV ?? "development";
const port = Number(process.env.PORT ?? 5000);

const defaultFrontendUrl = "http://localhost:3000";
const clientUrl =
  process.env.CLIENT_URL ??
  process.env.FRONTEND_URL ??
  defaultFrontendUrl;
const corsOrigin =
  process.env.CORS_ORIGIN ??
  process.env.CLIENT_URL ??
  process.env.FRONTEND_URL ??
  defaultFrontendUrl;

const WEAK_JWT_SECRETS = new Set([
  "change_this_secret",
  "secret",
  "jwt_secret",
  "your-secret",
  "your_jwt_secret",
]);

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  isDevelopment: nodeEnv !== "production",
  port: Number.isFinite(port) ? port : 5000,
  databaseUrl: process.env.DATABASE_URL ?? "",
  frontendUrl: process.env.FRONTEND_URL ?? clientUrl,
  clientUrl,
  corsOrigin,
  jwtSecret: process.env.JWT_SECRET ?? "",
  livekitUrl: process.env.LIVEKIT_URL ?? "",
  livekitApiKey: process.env.LIVEKIT_API_KEY ?? "",
  livekitApiSecret: process.env.LIVEKIT_API_SECRET ?? "",
  captchaProvider: process.env.CAPTCHA_PROVIDER ?? "",
  captchaSecret: process.env.CAPTCHA_SECRET ?? "",
  enableRedis: process.env.ENABLE_REDIS === "true",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  emailProvider: process.env.EMAIL_PROVIDER ?? "resend",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom:
    process.env.EMAIL_FROM ?? "Sosyal Oda <noreply@example.com>",
  appUrl:
    process.env.APP_URL ??
    process.env.CLIENT_URL ??
    process.env.FRONTEND_URL ??
    defaultFrontendUrl,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripePremiumMonthlyPriceId:
    process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? "",
  stripePremiumYearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID ?? "",
  betaMode: process.env.BETA_MODE === "true",
  betaAccessRequired: process.env.BETA_ACCESS_REQUIRED === "true",
};

if (!env.jwtSecret) {
  if (env.isProduction) {
    throw new Error("JWT_SECRET production ortamında zorunludur.");
  }

  console.warn("Uyarı: JWT_SECRET tanımlı değil. Auth endpointleri çalışmayacaktır.");
} else if (env.isProduction) {
  const normalizedSecret = env.jwtSecret.trim().toLowerCase();

  if (env.jwtSecret.length < 32 || WEAK_JWT_SECRETS.has(normalizedSecret)) {
    throw new Error(
      "JWT_SECRET production ortamında yeterince güçlü değil. En az 32 karakter kullanın.",
    );
  }
}
