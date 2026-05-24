import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as moderationController from "../moderation/moderation.controller";
import * as messageController from "./message.controller";

export const messageRouter = Router({ mergeParams: true });

messageRouter.get(
  "/",
  authMiddleware,
  asyncHandler(messageController.getRoomMessages),
);

messageRouter.delete(
  "/:messageId",
  authMiddleware,
  asyncHandler(moderationController.deleteMessage),
);
