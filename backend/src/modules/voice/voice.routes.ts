import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as voiceController from "./voice.controller";

export const voiceRouter = Router();

voiceRouter.post(
  "/token",
  authMiddleware,
  asyncHandler(voiceController.requestToken),
);
