import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as premiumController from "./premium.controller";

export const premiumRouter = Router();

premiumRouter.use(authMiddleware);

premiumRouter.get(
  "/status",
  asyncHandler(premiumController.getStatus),
);

premiumRouter.patch(
  "/preferences",
  asyncHandler(premiumController.updatePreferences),
);
