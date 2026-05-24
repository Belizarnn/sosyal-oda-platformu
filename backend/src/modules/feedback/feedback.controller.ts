import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { submitFeedbackSchema } from "./feedback.schemas";
import * as feedbackService from "./feedback.service";

export async function submitFeedback(req: Request, res: Response) {
  try {
    const input = submitFeedbackSchema.parse(req.body);
    const userId = (req as Partial<AuthenticatedRequest>).userId ?? null;
    const userAgent = req.headers["user-agent"];

    const result = await feedbackService.submitFeedback(input, {
      userId,
      userAgent: typeof userAgent === "string" ? userAgent : null,
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
