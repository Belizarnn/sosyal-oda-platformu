import { CommunityBotType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { getEnabledBot, writeBotLog } from "../communityBotUtils";

const BASIC_PROFANITY = ["amk", "aq", "siktir", "orospu", "piç"];

export async function getLogChannelRoomId(
  communityId: string,
  slug = "log-kayitlari",
): Promise<string | null> {
  const channel = await prisma.communityChannel.findFirst({
    where: { communityId, slug },
    select: { backingRoomId: true },
  });

  return channel?.backingRoomId ?? null;
}

export async function postCommunityLogMessage(
  communityId: string,
  content: string,
  action: string,
  metadata: Record<string, unknown> = {},
) {
  const bot = await getEnabledBot(communityId, CommunityBotType.LOG);
  if (!bot) {
    return;
  }

  const settings = bot.settings as { logChannelSlug?: string };
  const roomId = await getLogChannelRoomId(communityId, settings.logChannelSlug ?? "log-kayitlari");

  if (!roomId) {
    return;
  }

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { ownerId: true },
  });

  if (!community) {
    return;
  }

  await prisma.message.create({
    data: {
      roomId,
      senderId: community.ownerId,
      content: `[LOG] ${content}`,
    },
  });

  await writeBotLog(communityId, CommunityBotType.LOG, action, metadata);
}

export async function runModerationCheck(
  communityId: string,
  userId: string,
  content: string,
): Promise<{ blocked: boolean; reason?: string }> {
  const bot = await getEnabledBot(communityId, CommunityBotType.MODERATION);
  if (!bot) {
    return { blocked: false };
  }

  const settings = bot.settings as {
    profanityFilter?: boolean;
    spamFilter?: boolean;
    floodFilter?: boolean;
    capsFilter?: boolean;
    linkFilter?: boolean;
    mentionSpamFilter?: boolean;
    duplicateFilter?: boolean;
  };

  const lower = content.toLowerCase();

  if (settings.profanityFilter) {
    for (const word of BASIC_PROFANITY) {
      if (lower.includes(word)) {
        await postCommunityLogMessage(
          communityId,
          `Küfür filtresi tetiklendi (kullanıcı: ${userId})`,
          "moderation_profanity",
          { userId },
        );
        return { blocked: true, reason: "Küfür filtresi" };
      }
    }
  }

  if (settings.linkFilter && /https?:\/\//i.test(content)) {
    return { blocked: true, reason: "Link filtresi" };
  }

  if (settings.mentionSpamFilter && (content.match(/@/g)?.length ?? 0) > 5) {
    return { blocked: true, reason: "Mention spam" };
  }

  if (settings.capsFilter) {
    const letters = content.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ]/g, "");
    if (letters.length >= 8) {
      const upperRatio = letters.replace(/[^A-ZĞÜŞİÖÇ]/g, "").length / letters.length;
      if (upperRatio > 0.7) {
        return { blocked: true, reason: "Büyük harf spam" };
      }
    }
  }

  if (settings.duplicateFilter || settings.floodFilter || settings.spamFilter) {
    const channel = await prisma.communityChannel.findFirst({
      where: { communityId },
      select: { backingRoomId: true },
    });

    if (channel?.backingRoomId) {
      const recent = await prisma.message.findFirst({
        where: {
          roomId: channel.backingRoomId,
          senderId: userId,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      if (recent && recent.content === content) {
        return { blocked: true, reason: "Tekrarlı mesaj" };
      }
    }
  }

  return { blocked: false };
}

export async function runAutoReplyCheck(
  communityId: string,
  roomId: string,
  content: string,
): Promise<string | null> {
  const bot = await getEnabledBot(communityId, CommunityBotType.AUTO_REPLY);
  if (!bot) {
    return null;
  }

  const rules = await prisma.autoReplyRule.findMany({
    where: { communityId, enabled: true },
  });

  const trimmed = content.trim().toLowerCase();

  for (const rule of rules) {
    if (trimmed.includes(rule.trigger.toLowerCase()) || trimmed === rule.trigger.toLowerCase()) {
      const channelIds = rule.channelIds as string[];
      if (channelIds.length > 0) {
        const channel = await prisma.communityChannel.findFirst({
          where: { backingRoomId: roomId, communityId },
        });
        if (channel && !channelIds.includes(channel.id)) {
          continue;
        }
      }
      return rule.response;
    }
  }

  return null;
}
