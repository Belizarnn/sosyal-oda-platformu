import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  adminOnlyMiddleware,
  adminPanelMiddleware,
} from "../../middleware/admin.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as adminController from "./admin.controller";

export const adminRouter = Router();

adminRouter.use(authMiddleware);

adminRouter.get(
  "/summary",
  asyncHandler(adminPanelMiddleware),
  asyncHandler(adminController.getSummary),
);

adminRouter.get(
  "/analytics/summary",
  asyncHandler(adminPanelMiddleware),
  asyncHandler(adminController.getAnalyticsSummary),
);

adminRouter.get(
  "/reports",
  asyncHandler(adminPanelMiddleware),
  asyncHandler(adminController.listReports),
);

adminRouter.get(
  "/reports/:reportId",
  asyncHandler(adminPanelMiddleware),
  asyncHandler(adminController.getReportById),
);

adminRouter.patch(
  "/reports/:reportId/status",
  asyncHandler(adminOnlyMiddleware),
  asyncHandler(adminController.updateReportStatus),
);

adminRouter.get(
  "/feedback",
  asyncHandler(adminPanelMiddleware),
  asyncHandler(adminController.listFeedback),
);

adminRouter.patch(
  "/feedback/:feedbackId/status",
  asyncHandler(adminOnlyMiddleware),
  asyncHandler(adminController.updateFeedbackStatus),
);

adminRouter.get(
  "/beta-codes",
  asyncHandler(adminOnlyMiddleware),
  asyncHandler(adminController.listBetaCodes),
);

adminRouter.post(
  "/beta-codes",
  asyncHandler(adminOnlyMiddleware),
  asyncHandler(adminController.createBetaCode),
);
