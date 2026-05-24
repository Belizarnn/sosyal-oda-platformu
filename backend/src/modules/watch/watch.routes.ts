import { Router } from "express";

import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as watchController from "./watch.controller";

export const watchRouter = Router({ mergeParams: true });

watchRouter.get("/", authMiddleware, asyncHandler(watchController.getWatchState));

watchRouter.get(
  "/queue",
  authMiddleware,
  asyncHandler(watchController.getWatchQueue),
);

watchRouter.post(
  "/queue",
  authMiddleware,
  asyncHandler(watchController.addToWatchQueue),
);

watchRouter.delete(
  "/queue/:itemId",
  authMiddleware,
  asyncHandler(watchController.removeFromWatchQueue),
);

watchRouter.post(
  "/queue/:itemId/play",
  authMiddleware,
  asyncHandler(watchController.playQueueItem),
);

watchRouter.post(
  "/set-video",
  authMiddleware,
  asyncHandler(watchController.setWatchVideo),
);

watchRouter.post(
  "/set-media",
  authMiddleware,
  asyncHandler(watchController.setWatchMedia),
);

watchRouter.post(
  "/ready",
  authMiddleware,
  asyncHandler(watchController.setWatchReady),
);

watchRouter.post(
  "/countdown",
  authMiddleware,
  asyncHandler(watchController.startWatchCountdown),
);

watchRouter.post(
  "/control",
  authMiddleware,
  asyncHandler(watchController.controlWatch),
);

watchRouter.post(
  "/take-host",
  authMiddleware,
  asyncHandler(watchController.takeWatchHost),
);
