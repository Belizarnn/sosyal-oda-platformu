import { Router } from "express";
import { optionalAuthMiddleware } from "../../middleware/auth.middleware";
import { analyticsLimiter } from "../../middleware/rateLimit.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as analyticsController from "./analytics.controller";

export const analyticsRouter = Router();

analyticsRouter.post(
  "/events",
  analyticsLimiter,
  optionalAuthMiddleware,
  asyncHandler(analyticsController.trackEvent),
);
