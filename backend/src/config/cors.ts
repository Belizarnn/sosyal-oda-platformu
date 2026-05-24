import { env } from "./env";

function normalizeOrigin(origin: string): string {
  return origin.replace(/\/$/, "");
}

export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  for (const value of [env.clientUrl, env.corsOrigin, env.frontendUrl]) {
    if (value) {
      origins.add(normalizeOrigin(value));
    }
  }

  if (env.isDevelopment) {
    origins.add("http://localhost:3000");
  }

  return Array.from(origins);
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return env.isDevelopment;
  }

  return getAllowedOrigins().includes(normalizeOrigin(origin));
}
