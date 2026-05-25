import type { Request, Response } from "express";
import { ZodError } from "zod";
import { CommunityBotType } from "@prisma/client";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as communitySetupService from "./communitySetup.service";
import * as communityBotService from "./communityBot.service";
import {
  saveSetupBotsSchema,
  saveSetupChannelsSchema,
  updateBotSchema,
} from "./communitySetup.schemas";
import type { ChannelTemplateKey } from "../../constants/communitySetup";

function param(value: string | string[]): string {
  return Array.isArray(value) ? value[0] : value;
}

function handleValidationError(error: ZodError, res: Response) {
  const message = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message });
}

export async function getCommunitySetup(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communitySetupService.getCommunitySetup(param(req.params.communityId), userId);
  res.json(result);
}

export async function saveSetupChannels(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = saveSetupChannelsSchema.parse(req.body);
    const result = await communitySetupService.saveSetupChannels(
      param(req.params.communityId),
      userId,
      input.selectedChannels as ChannelTemplateKey[],
    );
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function saveSetupBots(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = saveSetupBotsSchema.parse(req.body);
    const result = await communitySetupService.saveSetupBots(
      param(req.params.communityId),
      userId,
      input.selectedBots,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function completeCommunitySetup(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communitySetupService.completeCommunitySetup(
    param(req.params.communityId),
    userId,
  );
  res.json(result);
}

export async function listCommunityBots(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityBotService.listCommunityBots(param(req.params.communityId), userId);
  res.json(result);
}

export async function updateCommunityBot(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updateBotSchema.parse(req.body);
    const result = await communityBotService.updateCommunityBot(
      param(req.params.communityId),
      param(req.params.botType) as CommunityBotType,
      userId,
      input,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }
    throw error;
  }
}

export async function getCommunityBotSettings(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityBotService.getCommunityBotSettings(
    param(req.params.communityId),
    param(req.params.botType) as CommunityBotType,
    userId,
  );
  res.json(result);
}

export async function listBotLogs(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await communityBotService.listBotLogs(param(req.params.communityId), userId);
  res.json(result);
}
