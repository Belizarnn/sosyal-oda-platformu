import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as communityController from "./community.controller";
import * as communityRoleController from "./communityRole.controller";
import * as communitySetupController from "./communitySetup.controller";

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
  "/:communityId/roles",
  authMiddleware,
  asyncHandler(communityRoleController.listCommunityRoles),
);
communityRouter.post(
  "/:communityId/roles",
  authMiddleware,
  asyncHandler(communityRoleController.createCommunityRole),
);
communityRouter.patch(
  "/:communityId/roles/reorder",
  authMiddleware,
  asyncHandler(communityRoleController.reorderCommunityRoles),
);
communityRouter.get(
  "/:communityId/roles/:roleId",
  authMiddleware,
  asyncHandler(communityRoleController.getCommunityRoleById),
);
communityRouter.patch(
  "/:communityId/roles/:roleId",
  authMiddleware,
  asyncHandler(communityRoleController.updateCommunityRole),
);
communityRouter.delete(
  "/:communityId/roles/:roleId",
  authMiddleware,
  asyncHandler(communityRoleController.deleteCommunityRole),
);

communityRouter.get(
  "/:communityId/members/:memberId/roles",
  authMiddleware,
  asyncHandler(communityRoleController.listMemberRoles),
);
communityRouter.post(
  "/:communityId/members/:memberId/roles/:roleId",
  authMiddleware,
  asyncHandler(communityRoleController.assignRoleToMember),
);
communityRouter.delete(
  "/:communityId/members/:memberId/roles/:roleId",
  authMiddleware,
  asyncHandler(communityRoleController.removeRoleFromMember),
);

communityRouter.get(
  "/:communityId/channels/:channelId/permissions",
  authMiddleware,
  asyncHandler(communityRoleController.getChannelPermissions),
);
communityRouter.patch(
  "/:communityId/channels/:channelId/permissions",
  authMiddleware,
  asyncHandler(communityRoleController.updateChannelPermissions),
);

communityRouter.get(
  "/:communityId/setup",
  authMiddleware,
  asyncHandler(communitySetupController.getCommunitySetup),
);
communityRouter.post(
  "/:communityId/setup/channels",
  authMiddleware,
  asyncHandler(communitySetupController.saveSetupChannels),
);
communityRouter.post(
  "/:communityId/setup/bots",
  authMiddleware,
  asyncHandler(communitySetupController.saveSetupBots),
);
communityRouter.post(
  "/:communityId/setup/complete",
  authMiddleware,
  asyncHandler(communitySetupController.completeCommunitySetup),
);

communityRouter.get(
  "/:communityId/bots",
  authMiddleware,
  asyncHandler(communitySetupController.listCommunityBots),
);
communityRouter.patch(
  "/:communityId/bots/:botType",
  authMiddleware,
  asyncHandler(communitySetupController.updateCommunityBot),
);
communityRouter.get(
  "/:communityId/bots/:botType/settings",
  authMiddleware,
  asyncHandler(communitySetupController.getCommunityBotSettings),
);
communityRouter.get(
  "/:communityId/bot-logs",
  authMiddleware,
  asyncHandler(communitySetupController.listBotLogs),
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
