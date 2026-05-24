import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as communityController from "./community.controller";

export const communityRouter = Router();
export const communityInviteRouter = Router();

communityRouter.get("/", authMiddleware, asyncHandler(communityController.listCommunities));
communityRouter.post("/", authMiddleware, asyncHandler(communityController.createCommunity));
communityRouter.get(
  "/:communityId",
  authMiddleware,
  asyncHandler(communityController.getCommunityById),
);
communityRouter.patch(
  "/:communityId",
  authMiddleware,
  asyncHandler(communityController.updateCommunity),
);
communityRouter.delete(
  "/:communityId",
  authMiddleware,
  asyncHandler(communityController.deleteCommunity),
);

communityRouter.post(
  "/:communityId/join",
  authMiddleware,
  asyncHandler(communityController.joinCommunity),
);
communityRouter.post(
  "/:communityId/leave",
  authMiddleware,
  asyncHandler(communityController.leaveCommunity),
);

communityRouter.get(
  "/:communityId/members",
  authMiddleware,
  asyncHandler(communityController.listCommunityMembers),
);
communityRouter.patch(
  "/:communityId/members/:memberId",
  authMiddleware,
  asyncHandler(communityController.updateCommunityMember),
);
communityRouter.delete(
  "/:communityId/members/:memberId",
  authMiddleware,
  asyncHandler(communityController.removeCommunityMember),
);

communityRouter.get(
  "/:communityId/channels",
  authMiddleware,
  asyncHandler(communityController.listCommunityChannels),
);
communityRouter.post(
  "/:communityId/channels",
  authMiddleware,
  asyncHandler(communityController.createCommunityChannel),
);
communityRouter.get(
  "/:communityId/channels/:channelId",
  authMiddleware,
  asyncHandler(communityController.getCommunityChannelById),
);
communityRouter.patch(
  "/:communityId/channels/:channelId",
  authMiddleware,
  asyncHandler(communityController.updateCommunityChannel),
);
communityRouter.delete(
  "/:communityId/channels/:channelId",
  authMiddleware,
  asyncHandler(communityController.deleteCommunityChannel),
);

communityRouter.get(
  "/:communityId/invites",
  authMiddleware,
  asyncHandler(communityController.listCommunityInvites),
);
communityRouter.post(
  "/:communityId/invites",
  authMiddleware,
  asyncHandler(communityController.createCommunityInvite),
);
communityRouter.delete(
  "/:communityId/invites/:inviteId",
  authMiddleware,
  asyncHandler(communityController.revokeCommunityInvite),
);

communityInviteRouter.get(
  "/:code",
  authMiddleware,
  asyncHandler(communityController.getCommunityInvitePreview),
);
communityInviteRouter.post(
  "/:code/accept",
  authMiddleware,
  asyncHandler(communityController.acceptCommunityInvite),
);
