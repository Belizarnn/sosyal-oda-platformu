import crypto from "crypto";

export function generateRawToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function verifyTokenHash(rawToken: string, tokenHash: string): boolean {
  const computed = hashToken(rawToken);

  if (computed.length !== tokenHash.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(computed, "utf8"),
    Buffer.from(tokenHash, "utf8"),
  );
}
