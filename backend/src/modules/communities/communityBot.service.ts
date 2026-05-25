import { CommunityBotType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";
import { getActiveCommunityMember } from "../../utils/communityPermissions";
import { hasServerPermission } from "../../utils/communityRoleEngine";
import {
  BOT_DEFINITIONS,
  type BotSettingsMap,
} from "../../constants/communitySetup";
import { formatBot, initializeCommunityBots, writeBotLog } from "../../utils/communityBotUtils";

async function assertCanManageBots(communityId: string, userId: string) {
  const canManage = await hasServerPermission(userId, communityId, "server.edit");

  if (!canManage) {
    throw new AppError(403, "Bot yönetme yetkiniz yok");
  }
}

export async function listCommunityBots(communityId: string, userId: string) {
  await getActiveCommunityMember(communityId, userId);

  const bots = await prisma.communityBot.findMany({
    where: { communityId },
    orderBy: { type: "asc" },
  });

  if (bots.length === 0) {
    await initializeCommunityBots(communityId);
    return listCommunityBots(communityId, userId);
  }

  const canManage = await hasServerPermission(userId, communityId, "server.edit");

  return {
    bots: bots.map(formatBot),
    definitions: Object.fromEntries(
      Object.entries(BOT_DEFINITIONS).map(([type, def]) => [
        type,
        { recommended: def.recommended, defaultSettings: def.defaultSettings },
      ]),
    ),
    canManageBots: canManage,
  };
}

export async function updateCommunityBot(
  communityId: string,
  botType: CommunityBotType,
  userId: string,
  input: { enabled?: boolean; settings?: BotSettingsMap },
) {
  await assertCanManageBots(communityId, userId);

  const bot = await prisma.communityBot.findUnique({
    where: { communityId_type: { communityId, type: botType } },
  });

  if (!bot) {
    throw new AppError(404, "Bot bulunamadı");
  }

  const updated = await prisma.communityBot.update({
    where: { id: bot.id },
    data: {
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.settings !== undefined
        ? { settings: input.settings as object }
        : {}),
    },
  });

  await writeBotLog(communityId, botType, input.enabled ? "bot_enabled" : "bot_updated", {
    enabled: updated.enabled,
  });

  return { bot: formatBot(updated) };
}

export async function getCommunityBotSettings(
  communityId: string,
  botType: CommunityBotType,
  userId: string,
) {
  await assertCanManageBots(communityId, userId);

  const bot = await prisma.communityBot.findUnique({
    where: { communityId_type: { communityId, type: botType } },
  });

  if (!bot) {
    throw new AppError(404, "Bot bulunamadı");
  }

  return { bot: formatBot(bot) };
}

export async function listBotLogs(
  communityId: string,
  userId: string,
  limit = 50,
) {
  const canView = await hasServerPermission(userId, communityId, "server.edit");

  if (!canView) {
    throw new AppError(403, "Bot loglarını görüntüleme yetkiniz yok");
  }

  await getActiveCommunityMember(communityId, userId);

  const logs = await prisma.botLog.findMany({
    where: { communityId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    logs: logs.map((log) => ({
      id: log.id,
      botType: log.botType,
      action: log.action,
      metadata: log.metadata,
      createdAt: log.createdAt.toISOString(),
    })),
  };
}

export { initializeCommunityBots };
