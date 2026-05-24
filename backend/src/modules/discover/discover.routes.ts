import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as discoverController from "./discover.controller";

export const discoverRouter = Router();

discoverRouter.get(
  "/rooms",
  authMiddleware,
  asyncHandler(discoverController.getDiscoverRooms),
);
