import type { Prisma } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";

export function normalizeBetaCode(rawCode: string): string {
  return rawCode.trim().toUpperCase();
}

export async function redeemBetaAccessCode(
  tx: Prisma.TransactionClient,
  rawCode: string,
): Promise<string> {
  const normalizedCode = normalizeBetaCode(rawCode);

  if (!normalizedCode) {
    throw new AppError(400, "Beta kayıt kodu gerekli.");
  }

  const code = await tx.betaAccessCode.findUnique({
    where: { code: normalizedCode },
  });

  if (!code || !code.isActive) {
    throw new AppError(400, "Geçersiz beta kayıt kodu.");
  }

  if (code.expiresAt && code.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, "Beta kayıt kodunun süresi dolmuş.");
  }

  const updated = await tx.betaAccessCode.updateMany({
    where: {
      id: code.id,
      isActive: true,
      usedCount: { lt: code.maxUses },
    },
    data: { usedCount: { increment: 1 } },
  });

  if (updated.count === 0) {
    throw new AppError(400, "Beta kayıt kodu kullanım limitine ulaştı.");
  }

  return code.id;
}

export function assertBetaCodeProvided(betaCode?: string | null) {
  if (!env.betaAccessRequired) {
    return;
  }

  if (!betaCode?.trim()) {
    throw new AppError(400, "Beta kayıt kodu gerekli.");
  }
}

export function getPublicConfig() {
  return {
    betaMode: env.betaMode,
    betaAccessRequired: env.betaAccessRequired,
  };
}

function formatBetaAccessCode(code: {
  id: string;
  code: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  expiresAt: Date | null;
}) {
  return {
    id: code.id,
    code: code.code,
    maxUses: code.maxUses,
    usedCount: code.usedCount,
    isActive: code.isActive,
    createdAt: code.createdAt.toISOString(),
    expiresAt: code.expiresAt?.toISOString() ?? null,
  };
}

export async function listAdminBetaCodes() {
  const codes = await prisma.betaAccessCode.findMany({
    orderBy: [{ createdAt: "desc" }],
  });

  return {
    codes: codes.map(formatBetaAccessCode),
  };
}

export async function createAdminBetaCode(input: {
  code: string;
  maxUses: number;
  expiresAt?: Date | null;
}) {
  const normalizedCode = normalizeBetaCode(input.code);

  if (!normalizedCode) {
    throw new AppError(400, "Beta kodu boş olamaz.");
  }

  const existing = await prisma.betaAccessCode.findUnique({
    where: { code: normalizedCode },
  });

  if (existing) {
    throw new AppError(409, "Bu beta kodu zaten mevcut.");
  }

  const code = await prisma.betaAccessCode.create({
    data: {
      code: normalizedCode,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt ?? null,
    },
  });

  return {
    message: "Beta kodu oluşturuldu.",
    code: formatBetaAccessCode(code),
  };
}
