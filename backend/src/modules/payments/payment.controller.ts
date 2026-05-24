import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { createCheckoutSessionSchema } from "./payment.schemas";
import * as paymentService from "./payment.service";

function handleValidationError(error: ZodError, res: Response) {
  const firstError = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message: firstError });
}

export async function createCheckoutSession(req: Request, res: Response) {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const input = createCheckoutSessionSchema.parse(req.body);
    const result = await paymentService.createCheckoutSession(userId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function createCustomerPortalSession(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await paymentService.createCustomerPortalSession(userId);
  res.json(result);
}

export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  const result = await paymentService.processStripeWebhook(
    req.body as Buffer,
    typeof signature === "string" ? signature : undefined,
  );

  res.json(result);
}
