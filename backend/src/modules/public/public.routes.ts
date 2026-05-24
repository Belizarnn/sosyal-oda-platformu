import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as publicController from "./public.controller";

export const publicRouter = Router();

publicRouter.get("/config", asyncHandler(publicController.getPublicConfig));
