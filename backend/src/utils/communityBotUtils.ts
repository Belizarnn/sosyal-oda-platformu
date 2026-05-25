import { CommunityBotType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  ALL_BOT_TYPES,
  BOT_DEFINITIONS,
  type BotSettingsMap,
} from "../constants/communitySetup";

export async function initializeCommunityBots(communityId: string) {
  for (const type of ALL_BOT_TYPES) {
    const definition = BOT_DEFINITIONS[type];
    await prisma.communityBot.upsert({
      where: {
        communityId_type: { communityId, type },
      },
      create: {
        communityId,
        type,
        enabled: definition.defaultEnabled,
        settings: definition.defaultSettings as object,
      },
      update: {},
    });

    if (type === CommunityBotType.MODERATION) {
      await seedModerationRules(communityId);
    }

    if (type === CommunityBotType.AUTO_REPLY) {
      await seedAutoReplyRules(communityId);
    }
  }
}

async function seedModerationRules(communityId: string) {
  const rules = [
    { type: "profanity", enabled: true, action: "delete" },
    { type: "spam", enabled: true, action: "delete" },
    { type: "flood", enabled: true, action: "delete" },
    { type: "caps", enabled: false, action: "delete" },
    { type: "links", enabled: false, action: "delete" },
    { type: "mention_spam", enabled: true, action: "delete" },
    { type: "duplicate", enabled: true, action: "delete" },
  ];

  for (const rule of rules) {
    await prisma.moderationRule.upsert({
      where: {
        communityId_type: { communityId, type: rule.type },
      },
      create: {
        communityId,
        type: rule.type,
        enabled: rule.enabled,
        action: rule.action,
        settings: {},
      },
      update: {},
    });
  }
}

async function seedAutoReplyRules(communityId: string) {
  const bot = await prisma.communityBot.findUnique({
    where: { communityId_type: { communityId, type: CommunityBotType.AUTO_REPLY } },
  });

  const rules = (bot?.settings as BotSettingsMap)?.rules as Array<{
    trigger: string;
    response: string;
  }> | undefined;

  if (!rules?.length) {
    return;
  }

  for (const rule of rules) {
    const existing = await prisma.autoReplyRule.findFirst({
      where: { communityId, trigger: rule.trigger },
    });

    if (!existing) {
      await prisma.autoReplyRule.create({
        data: {
          communityId,
          trigger: rule.trigger,
          response: rule.response,
          enabled: false,
        },
      });
    }
  }
}

export async function getEnabledBot(
  communityId: string,
  type: CommunityBotType,
) {
  return prisma.communityBot.findFirst({
    where: { communityId, type, enabled: true },
  });
}

export async function writeBotLog(
  communityId: string,
  botType: CommunityBotType,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  await prisma.botLog.create({
    data: {
      communityId,
      botType,
      action,
      metadata: metadata as object,
    },
  });
}

export function formatBot(bot: {
  id: string;
  communityId: string;
  type: CommunityBotType;
  enabled: boolean;
  settings: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: bot.id,
    communityId: bot.communityId,
    type: bot.type,
    enabled: bot.enabled,
    settings: (bot.settings ?? {}) as BotSettingsMap,
    createdAt: bot.createdAt.toISOString(),
    updatedAt: bot.updatedAt.toISOString(),
  };
}
