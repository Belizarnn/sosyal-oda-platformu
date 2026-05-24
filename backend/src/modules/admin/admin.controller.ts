import type { Request, Response } from "express";
import { ZodError } from "zod";
import * as adminService from "./admin.service";
import {
  listAdminReportsQuerySchema,
  reportIdParamSchema,
  updateReportStatusSchema,
} from "./admin.schemas";
import {
  feedbackIdParamSchema,
  listAdminFeedbackQuerySchema,
  updateFeedbackStatusSchema,
} from "../feedback/feedback.schemas";
import { createBetaCodeSchema } from "../beta/beta.schemas";

export async function getSummary(_req: Request, res: Response) {
  const summary = await adminService.getAdminSummary();
  res.json(summary);
}

export async function getAnalyticsSummary(_req: Request, res: Response) {
  const summary = await adminService.getAnalyticsSummary();
  res.json(summary);
}

export async function listReports(req: Request, res: Response) {
  try {
    const query = listAdminReportsQuerySchema.parse(req.query);
    const result = await adminService.listAdminReports(query);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message, code: "VALIDATION_ERROR" });
      return;
    }

    throw error;
  }
}

export async function getReportById(req: Request, res: Response) {
  try {
    const { reportId } = reportIdParamSchema.parse({ reportId: req.params.reportId });
    const result = await adminService.getAdminReportById(reportId);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Geçersiz rapor ID", code: "VALIDATION_ERROR" });
      return;
    }

    throw error;
  }
}

export async function updateReportStatus(req: Request, res: Response) {
  try {
    const { reportId } = reportIdParamSchema.parse({ reportId: req.params.reportId });
    const input = updateReportStatusSchema.parse(req.body);
    const result = await adminService.updateAdminReportStatus(reportId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message, code: "VALIDATION_ERROR" });
      return;
    }

    throw error;
  }
}

export async function listFeedback(req: Request, res: Response) {
  try {
    const query = listAdminFeedbackQuerySchema.parse(req.query);
    const result = await adminService.listAdminFeedback(query);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message, code: "VALIDATION_ERROR" });
      return;
    }

    throw error;
  }
}

export async function updateFeedbackStatus(req: Request, res: Response) {
  try {
    const { feedbackId } = feedbackIdParamSchema.parse({
      feedbackId: req.params.feedbackId,
    });
    const input = updateFeedbackStatusSchema.parse(req.body);
    const result = await adminService.updateAdminFeedbackStatus(feedbackId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message, code: "VALIDATION_ERROR" });
      return;
    }

    throw error;
  }
}

export async function listBetaCodes(_req: Request, res: Response) {
  const result = await adminService.listAdminBetaCodes();
  res.json(result);
}

export async function createBetaCode(req: Request, res: Response) {
  try {
    const input = createBetaCodeSchema.parse(req.body);
    const result = await adminService.createAdminBetaCode({
      code: input.code,
      maxUses: input.maxUses,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
    });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message, code: "VALIDATION_ERROR" });
      return;
    }

    throw error;
  }
}
