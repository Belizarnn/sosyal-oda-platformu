import { z } from "zod";

export const createBetaCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Beta kodu boş olamaz")
    .max(64, "Beta kodu en fazla 64 karakter olabilir"),
  maxUses: z.number().int().min(1).max(10000).optional().default(1),
  expiresAt: z
    .string()
    .trim()
    .datetime({ message: "Geçersiz bitiş tarihi" })
    .optional()
    .nullable(),
});

export type CreateBetaCodeInput = z.infer<typeof createBetaCodeSchema>;
