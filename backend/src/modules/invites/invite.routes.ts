import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import { inviteLimiter } from "../../middleware/rateLimit.middleware";

import { asyncHandler } from "../../utils/asyncHandler";

import * as inviteController from "./invite.controller";



export const invitePreviewRouter = Router();



invitePreviewRouter.get(

  "/:inviteCode",

  authMiddleware,

  inviteLimiter,

  asyncHandler(inviteController.getInvitePreview),

);

