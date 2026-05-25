import { z } from "zod";
import { CommunityBotType } from "@prisma/client";
import { CHANNEL_TEMPLATE_DEFINITIONS } from "../../constants/communitySetup";

const channelTemplateKeys = Object.keys(CHANNEL_TEMPLATE_DEFINITIONS) as Array<
  keyof typeof CHANNEL_TEMPLATE_DEFINITIONS
>;

export const saveSetupChannelsSchema = z.object({
  selectedChannels: z.array(z.string()).min(1),
});

export const saveSetupBotsSchema = z.object({
  selectedBots: z.record(z.string(), z.boolean()),
});

export const updateBotSchema = z.object({
  enabled: z.boolean().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export const botTypeParamSchema = z.nativeEnum(CommunityBotType);
