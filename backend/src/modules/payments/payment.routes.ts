import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { authLimiter } from "../../middleware/rateLimit.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as paymentController from "./payment.controller";

export const paymentRouter = Router();

paymentRouter.post(
  "/create-checkout-session",
  authLimiter,
  authMiddleware,
  asyncHandler(paymentController.createCheckoutSession),
);

paymentRouter.post(
  "/create-customer-portal-session",
  authLimiter,
  authMiddleware,
  asyncHandler(paymentController.createCustomerPortalSession),
);
