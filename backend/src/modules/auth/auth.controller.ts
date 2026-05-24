import type { Request, Response } from "express";
import { ZodError } from "zod";
import { verifyCaptcha } from "../../lib/captcha";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { AppError } from "../../utils/asyncHandler";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.schemas";
import * as authService from "./auth.service";

function handleValidationError(error: ZodError, res: Response) {
  const firstError = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message: firstError });
}

export async function register(req: Request, res: Response) {
  try {
    const input = registerSchema.parse(req.body);

    const captchaOk = await verifyCaptcha(
      typeof req.body?.captchaToken === "string" ? req.body.captchaToken : null,
    );

    if (!captchaOk) {
      throw new AppError(400, "Captcha doğrulanamadı.");
    }

    const result = await authService.registerUser(input);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function login(req: Request, res: Response) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.loginUser(input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function resendVerification(req: Request, res: Response) {
  const userId = (req as AuthenticatedRequest).userId;
  const result = await authService.resendVerificationEmail(userId);
  res.json(result);
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const input = verifyEmailSchema.parse(req.body);
    const result = await authService.verifyEmail(input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const input = forgotPasswordSchema.parse(req.body);
    const result = await authService.forgotPassword(input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const input = resetPasswordSchema.parse(req.body);
    const result = await authService.resetPassword(input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export function assertAuthConfigured() {
  if (!process.env.JWT_SECRET) {
    throw new AppError(500, "Sunucu yapılandırması eksik");
  }
}
