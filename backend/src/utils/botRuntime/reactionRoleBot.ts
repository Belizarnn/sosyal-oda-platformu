import { CommunityBotType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { getEnabledBot } from "../communityBotUtils";

export async function seedReactionRolePanel(communityId: string) {
  const bot = await getEnabledBot(communityId, CommunityBotType.REACTION_ROLE);
  if (!bot) {
    return;
  }

  const settings = bot.settings as {
    channelSlug?: string;
    messageTitle?: string;
    items?: Array<{ emoji: string; roleName: string; color: string }>;
  };

  const channel = await prisma.communityChannel.findFirst({
    where: {
      communityId,
      slug: settings.channelSlug ?? "rol-secim",
    },
  });

  if (!channel) {
    return;
  }

  const existing = await prisma.reactionRoleMessage.findFirst({
    where: { communityId, channelId: channel.id },
  });

  if (existing) {
    return;
  }

  const items = settings.items ?? [];
  const description = items.map((item) => `${item.emoji} → ${item.roleName}`).join("\n");

  await prisma.reactionRoleMessage.create({
    data: {
      communityId,
      channelId: channel.id,
      title: settings.messageTitle ?? "Rol seç",
      description,
      items: items as object,
    },
  });

  if (channel.backingRoomId) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { ownerId: true },
    });

    if (community) {
      await prisma.message.create({
        data: {
          roomId: channel.backingRoomId,
          senderId: community.ownerId,
          content: `[ROL SEÇİM] ${settings.messageTitle ?? "Rol seç"}\n${description}\n\nEmojiye basarak rol alabilirsin.`,
        },
      });
    }
  }
}
