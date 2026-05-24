import { ReportTargetType } from "@prisma/client";
import { z } from "zod";

export const muteMemberSchema = z.object({
  mutedUntil: z
    .string()
    .datetime({ message: "Geçerli bir tarih girin" })
    .optional()
    .nullable(),
});

export const createReportSchema = z
  .object({
    targetType: z.nativeEnum(ReportTargetType, {
      message: "Geçersiz rapor hedefi",
    }),
    targetUserId: z.string().optional().nullable(),
    targetMessageId: z.string().optional().nullable(),
    targetRoomId: z.string().optional().nullable(),
    reason: z
      .string()
      .trim()
      .min(1, "Sebep zorunlu")
      .max(120, "Sebep en fazla 120 karakter olabilir"),
    description: z
      .string()
      .trim()
      .max(500, "Açıklama en fazla 500 karakter olabilir")
      .optional()
      .nullable()
      .transform((value) => {
        if (value === undefined || value === null) {
          return null;
        }

        return value.length > 0 ? value : null;
      }),
  })
  .superRefine((data, ctx) => {
    if (data.targetType === ReportTargetType.USER && !data.targetUserId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetUserId zorunlu",
        path: ["targetUserId"],
      });
    }

    if (data.targetType === ReportTargetType.MESSAGE && !data.targetMessageId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetMessageId zorunlu",
        path: ["targetMessageId"],
      });
    }

    if (data.targetType === ReportTargetType.ROOM && !data.targetRoomId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetRoomId zorunlu",
        path: ["targetRoomId"],
      });
    }
  });

export type MuteMemberInput = z.infer<typeof muteMemberSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
