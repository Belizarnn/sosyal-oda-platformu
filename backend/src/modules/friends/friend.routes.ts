import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as friendController from "./friend.controller";

export const friendRouter = Router();

friendRouter.use(authMiddleware);

friendRouter.post("/requests", asyncHandler(friendController.sendFriendRequest));

friendRouter.get(
  "/requests/incoming",
  asyncHandler(friendController.getIncomingFriendRequests),
);

friendRouter.get(
  "/requests/outgoing",
  asyncHandler(friendController.getOutgoingFriendRequests),
);

friendRouter.post(
  "/requests/:requestId/accept",
  asyncHandler(friendController.acceptFriendRequest),
);

friendRouter.post(
  "/requests/:requestId/reject",
  asyncHandler(friendController.rejectFriendRequest),
);

friendRouter.post(
  "/requests/:requestId/cancel",
  asyncHandler(friendController.cancelFriendRequest),
);

friendRouter.get("/activity", asyncHandler(friendController.getFriendsActivity));

friendRouter.get("/", asyncHandler(friendController.getFriends));

friendRouter.delete("/:userId", asyncHandler(friendController.removeFriend));
