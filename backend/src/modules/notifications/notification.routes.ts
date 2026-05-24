import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";

import { asyncHandler } from "../../utils/asyncHandler";

import * as notificationController from "./notification.controller";



export const notificationRouter = Router();



notificationRouter.use(authMiddleware);



notificationRouter.get(

  "/preferences",

  asyncHandler(notificationController.getPreferences),

);



notificationRouter.patch(

  "/preferences",

  asyncHandler(notificationController.updatePreferences),

);



notificationRouter.delete(

  "/",

  asyncHandler(notificationController.deleteAllNotifications),

);



notificationRouter.get(

  "/unread-count",

  asyncHandler(notificationController.getUnreadCount),

);



notificationRouter.patch(

  "/read-all",

  asyncHandler(notificationController.markAllAsRead),

);



notificationRouter.get("/", asyncHandler(notificationController.getNotifications));



notificationRouter.patch(

  "/:notificationId/read",

  asyncHandler(notificationController.markAsRead),

);



notificationRouter.delete(

  "/:notificationId",

  asyncHandler(notificationController.deleteNotificationById),

);


