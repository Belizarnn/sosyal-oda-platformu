import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { AppError } from "../utils/asyncHandler";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      message: error.message,
      ...(error.code ? { code: error.code } : {}),
    });
    return;
  }

  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Geçersiz istek";
    res.status(400).json({ message, code: "VALIDATION_ERROR" });
    return;
  }

  if (env.isDevelopment) {
    console.error(error);
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Beklenmeyen sunucu hatası");
  }

  res.status(500).json({ message: "Sunucu hatası", code: "INTERNAL_ERROR" });
}
