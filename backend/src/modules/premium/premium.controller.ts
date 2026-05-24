import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { updatePremiumPreferencesSchema } from "./premium.schemas";
import * as premiumService from "./premium.service";

function handleValidationError(error: ZodError, res: Response) {
  const firstError = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message: firstError });
}

export async function getStatus(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const status = await premiumService.getPremiumStatusForUser(userId);
  res.json(status);
}

export async function updatePreferences(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const input = updatePremiumPreferencesSchema.parse(req.body);
    const result = await premiumService.updatePremiumPreferences(userId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}
