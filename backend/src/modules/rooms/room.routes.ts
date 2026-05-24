import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { messageRouter } from "../messages/message.routes";
import { watchRouter } from "../watch/watch.routes";
import { moderationMemberRouter } from "../moderation/moderation.routes";
import * as inviteController from "../invites/invite.controller";
import { asyncHandler } from "../../utils/asyncHandler";
import * as roomController from "./room.controller";

export const roomRouter = Router();

roomRouter.get("/", authMiddleware, asyncHandler(roomController.listRooms));

roomRouter.post(
  "/",
  authMiddleware,
  asyncHandler(roomController.createRoom),
);

roomRouter.post(
  "/:roomId/invite/regenerate",
  authMiddleware,
  asyncHandler(inviteController.regenerateRoomInvite),
);

roomRouter.patch(
  "/:roomId/invite/settings",
  authMiddleware,
  asyncHandler(inviteController.updateInviteSettings),
);

roomRouter.use("/:roomId/messages", messageRouter);
roomRouter.use("/:roomId/watch", watchRouter);
roomRouter.use("/:roomId/members", moderationMemberRouter);

roomRouter.get("/:id", authMiddleware, asyncHandler(roomController.getRoomById));

roomRouter.post(
  "/:id/join",
  authMiddleware,
  asyncHandler(roomController.joinRoom),
);

roomRouter.post(
  "/:id/leave",
  authMiddleware,
  asyncHandler(roomController.leaveRoom),
);
