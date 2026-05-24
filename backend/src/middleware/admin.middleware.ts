import type { NextFunction, Request, Response } from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";
import type { AuthenticatedRequest } from "./auth.middleware";
import { AppError } from "../utils/asyncHandler";

export interface AdminRequest extends AuthenticatedRequest {
  userRole: UserRole;
}

async function loadUserRole(userId: string): Promise<UserRole> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) {
    throw new AppError(401, "Oturumun sona ermiş olabilir.", "UNAUTHORIZED");
  }

  return user.role;
}

export async function adminPanelMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const role = await loadUserRole(userId);

    if (role !== UserRole.ADMIN && role !== UserRole.MODERATOR) {
      throw new AppError(403, "Bu sayfaya erişim yetkin yok.", "FORBIDDEN");
    }

    (req as AdminRequest).userRole = role;
    next();
  } catch (error) {
    next(error);
  }
}

export async function adminOnlyMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const role = await loadUserRole(userId);

    if (role !== UserRole.ADMIN) {
      throw new AppError(403, "Bu işlem için admin yetkisi gerekli.", "FORBIDDEN");
    }

    (req as AdminRequest).userRole = role;
    next();
  } catch (error) {
    next(error);
  }
}

export function isAdminPanelRole(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.MODERATOR;
}

export function isAdminRole(role: UserRole): boolean {
  return role === UserRole.ADMIN;
}
