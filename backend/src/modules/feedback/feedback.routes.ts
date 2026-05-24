import { Router } from "express";
import { optionalAuthMiddleware } from "../../middleware/auth.middleware";
import { feedbackLimiter } from "../../middleware/rateLimit.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as feedbackController from "./feedback.controller";

export const feedbackRouter = Router();

feedbackRouter.post(
  "/",
  feedbackLimiter,
  optionalAuthMiddleware,
  asyncHandler(feedbackController.submitFeedback),
);
