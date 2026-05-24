import { FeedbackType } from "@prisma/client";
import { z } from "zod";

export const submitFeedbackSchema = z.object({
  type: z.nativeEnum(FeedbackType, {
    message: "Geçersiz geri bildirim türü",
  }),
  title: z
    .string()
    .trim()
    .min(1, "Başlık zorunludur")
    .max(120, "Başlık en fazla 120 karakter olabilir"),
  message: z
    .string()
    .trim()
    .min(1, "Mesaj zorunludur")
    .max(1000, "Mesaj en fazla 1000 karakter olabilir"),
  rating: z
    .number()
    .int()
    .min(1, "Puan en az 1 olabilir")
    .max(5, "Puan en fazla 5 olabilir")
    .optional()
    .nullable(),
  pageUrl: z.string().trim().max(500).optional().nullable(),
});

export const listAdminFeedbackQuerySchema = z.object({
  status: z
    .enum(["OPEN", "REVIEWED", "PLANNED", "RESOLVED", "REJECTED"])
    .optional(),
  type: z.nativeEnum(FeedbackType).optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(20),
  cursor: z.string().min(1).optional(),
});

export const feedbackIdParamSchema = z.object({
  feedbackId: z.string().trim().min(1, "Geri bildirim ID gerekli"),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(["OPEN", "REVIEWED", "PLANNED", "RESOLVED", "REJECTED"], {
    message: "Geçersiz geri bildirim durumu",
  }),
});

export type SubmitFeedbackInput = z.infer<typeof submitFeedbackSchema>;
export type ListAdminFeedbackQuery = z.infer<typeof listAdminFeedbackQuerySchema>;
export type UpdateFeedbackStatusInput = z.infer<typeof updateFeedbackStatusSchema>;
