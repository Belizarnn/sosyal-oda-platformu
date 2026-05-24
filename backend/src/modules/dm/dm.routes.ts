import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import { messageLimiter } from "../../middleware/rateLimit.middleware";

import { asyncHandler } from "../../utils/asyncHandler";

import * as dmController from "./dm.controller";



export const dmRouter = Router();



dmRouter.use(authMiddleware);



dmRouter.get("/conversations", asyncHandler(dmController.getConversations));



dmRouter.post(

  "/conversations/direct",

  asyncHandler(dmController.startDirectConversation),

);



dmRouter.get(

  "/conversations/:conversationId/messages",

  asyncHandler(dmController.getConversationMessages),

);



dmRouter.post(

  "/conversations/:conversationId/messages",

  messageLimiter,

  asyncHandler(dmController.sendConversationMessage),

);



dmRouter.delete(

  "/conversations/:conversationId/messages/:messageId",

  asyncHandler(dmController.deleteConversationMessage),

);

