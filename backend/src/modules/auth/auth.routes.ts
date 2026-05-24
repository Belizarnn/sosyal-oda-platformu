import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  authLimiter,
  registerLimiter,
} from "../../middleware/rateLimit.middleware";
import * as authController from "./auth.controller";

export const authRouter = Router();

authRouter.post(
  "/register",
  registerLimiter,
  asyncHandler(async (req, res) => {
    authController.assertAuthConfigured();
    await authController.register(req, res);
  }),
);

authRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    authController.assertAuthConfigured();
    await authController.login(req, res);
  }),
);

authRouter.post(
  "/resend-verification",
  authLimiter,
  authMiddleware,
  asyncHandler(async (req, res) => {
    authController.assertAuthConfigured();
    await authController.resendVerification(req, res);
  }),
);

authRouter.post(
  "/verify-email",
  authLimiter,
  asyncHandler(async (req, res) => {
    await authController.verifyEmail(req, res);
  }),
);

authRouter.post(
  "/forgot-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    await authController.forgotPassword(req, res);
  }),
);

authRouter.post(
  "/reset-password",
  authLimiter,
  asyncHandler(async (req, res) => {
    await authController.resetPassword(req, res);
  }),
);
