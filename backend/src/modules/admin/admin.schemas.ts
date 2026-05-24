import { ReportStatus, ReportTargetType } from "@prisma/client";
import { z } from "zod";

export const listAdminReportsQuerySchema = z.object({
  status: z.nativeEnum(ReportStatus).optional(),
  targetType: z.nativeEnum(ReportTargetType).optional(),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(20),
  cursor: z.string().min(1).optional(),
});

export const reportIdParamSchema = z.object({
  reportId: z.string().trim().min(1, "Rapor ID gerekli"),
});

export const updateReportStatusSchema = z.object({
  status: z.nativeEnum(ReportStatus, {
    message: "Geçersiz rapor durumu",
  }),
});

export type ListAdminReportsQuery = z.infer<typeof listAdminReportsQuerySchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
