import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { AppError } from "../../utils/asyncHandler";
import * as dashboardService from "./dashboard.service";

export async function getDashboard(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const dashboard = await dashboardService.getDashboard(userId);

  if (!dashboard) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  res.json(dashboard);
}
