import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { trackAnalyticsEventSchema } from "./analytics.schemas";
import * as analyticsService from "./analytics.service";

export async function trackEvent(req: Request, res: Response) {
  try {
    const input = trackAnalyticsEventSchema.parse(req.body);
    const userId = (req as Partial<AuthenticatedRequest>).userId ?? null;
    const userAgent = req.headers["user-agent"];

    const result = await analyticsService.trackClientEvent(input, {
      userId,
      userAgent: typeof userAgent === "string" ? userAgent : null,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message });
      return;
    }

    throw error;
  }
}
