import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as userController from "./user.controller";

export const userRouter = Router();

userRouter.get(
  "/me",
  authMiddleware,
  asyncHandler(userController.getMe),
);

userRouter.patch(
  "/me/presence",
  authMiddleware,
  asyncHandler(userController.updatePresence),
);

userRouter.patch(
  "/me/profile",
  authMiddleware,
  asyncHandler(userController.updateProfile),
);

userRouter.patch(
  "/me/password",
  authMiddleware,
  asyncHandler(userController.changePassword),
);

userRouter.patch(
  "/me/preferences",
  authMiddleware,
  asyncHandler(userController.updatePreferences),
);

userRouter.get(
  "/:handle/social",
  authMiddleware,
  asyncHandler(userController.getSocialByHandle),
);

userRouter.get(
  "/:handle",
  authMiddleware,
  asyncHandler(userController.getProfileByHandle),
);
