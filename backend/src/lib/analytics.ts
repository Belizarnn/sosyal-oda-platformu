import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "email",
  "content",
  "message",
  "messagecontent",
  "body",
  "authorization",
  "secret",
  "stripe",
  "card",
  "cvv",
  "payment",
  "accesstoken",
  "refreshtoken",
  "passwordhash",
  "jwt",
  "creditcard",
]);

const MAX_PROPERTIES_JSON_LENGTH = 2048;
const MAX_PROPERTY_KEYS = 20;
const MAX_STRING_VALUE_LENGTH = 200;

function isSensitiveKey(key: string): boolean {
  const normalized = key.toLowerCase();

  if (SENSITIVE_KEYS.has(normalized)) {
    return true;
  }

  return (
    normalized.includes("password") ||
    normalized.includes("token") ||
    normalized.includes("email") ||
    normalized.includes("content") ||
    normalized.includes("secret") ||
    normalized.includes("payment")
  );
}

export function sanitizeAnalyticsProperties(
  properties?: Record<string, unknown> | null,
): Prisma.InputJsonValue | undefined {
  if (!properties || typeof properties !== "object" || Array.isArray(properties)) {
    return undefined;
  }

  const sanitized: Record<string, string | number | boolean | null> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (Object.keys(sanitized).length >= MAX_PROPERTY_KEYS) {
      break;
    }

    if (isSensitiveKey(key)) {
      continue;
    }

    if (typeof value === "string") {
      sanitized[key] = value.slice(0, MAX_STRING_VALUE_LENGTH);
    } else if (typeof value === "number" && Number.isFinite(value)) {
      sanitized[key] = value;
    } else if (typeof value === "boolean") {
      sanitized[key] = value;
    } else if (value === null) {
      sanitized[key] = null;
    }
  }

  if (Object.keys(sanitized).length === 0) {
    return undefined;
  }

  if (JSON.stringify(sanitized).length > MAX_PROPERTIES_JSON_LENGTH) {
    return undefined;
  }

  return sanitized;
}

export async function trackServerEvent(input: {
  eventName: string;
  userId?: string | null;
  properties?: Record<string, unknown> | null;
  sessionId?: string | null;
  path?: string | null;
  userAgent?: string | null;
}) {
  try {
    await prisma.analyticsEvent.create({
      data: {
        eventName: input.eventName.slice(0, 80),
        userId: input.userId ?? null,
        properties: sanitizeAnalyticsProperties(input.properties),
        sessionId: input.sessionId?.slice(0, 64) ?? null,
        path: input.path?.slice(0, 500) ?? null,
        userAgent: input.userAgent?.slice(0, 500) ?? null,
      },
    });
  } catch {
    // Analytics must not break core flows.
  }
}
