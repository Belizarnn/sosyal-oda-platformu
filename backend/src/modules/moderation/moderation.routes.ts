import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import { reportLimiter } from "../../middleware/rateLimit.middleware";

import { asyncHandler } from "../../utils/asyncHandler";

import * as moderationController from "./moderation.controller";



export const moderationMemberRouter = Router({ mergeParams: true });



moderationMemberRouter.post(

  "/:userId/kick",

  authMiddleware,

  asyncHandler(moderationController.kickMember),

);



moderationMemberRouter.post(

  "/:userId/mute",

  authMiddleware,

  asyncHandler(moderationController.muteMember),

);



moderationMemberRouter.post(

  "/:userId/unmute",

  authMiddleware,

  asyncHandler(moderationController.unmuteMember),

);



moderationMemberRouter.post(

  "/:userId/ban",

  authMiddleware,

  asyncHandler(moderationController.banMember),

);



moderationMemberRouter.post(

  "/:userId/unban",

  authMiddleware,

  asyncHandler(moderationController.unbanMember),

);



export const reportsRouter = Router();



reportsRouter.post(

  "/",

  authMiddleware,

  reportLimiter,

  asyncHandler(moderationController.createReport),

);

