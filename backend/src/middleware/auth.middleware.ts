import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt";

export interface AuthenticatedRequest extends Request {
  userId: string;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Bu içeriğe erişmek için giriş yapmalısın.",
      code: "UNAUTHORIZED",
    });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    (req as AuthenticatedRequest).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({
      message: "Geçersiz veya süresi dolmuş token",
      code: "INVALID_TOKEN",
    });
  }
}

export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = verifyToken(authHeader.slice(7));
      (req as AuthenticatedRequest).userId = payload.userId;
    } catch {
      // Invalid token is ignored for optional auth endpoints.
    }
  }

  next();
}
