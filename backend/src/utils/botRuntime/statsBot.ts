import { CommunityBotType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { getEnabledBot } from "../communityBotUtils";

export async function updateStatsChannel(communityId: string) {
  const bot = await getEnabledBot(communityId, CommunityBotType.STATS);
  if (!bot) {
    return;
  }

  const settings = bot.settings as { statsChannelSlug?: string };
  const channel = await prisma.communityChannel.findFirst({
    where: {
      communityId,
      slug: settings.statsChannelSlug ?? "sunucu-istatistik",
    },
    select: { backingRoomId: true },
  });

  if (!channel?.backingRoomId) {
    return;
  }

  const roomIds = (
    await prisma.communityChannel.findMany({
      where: { communityId },
      select: { backingRoomId: true },
    })
  )
    .map((item) => item.backingRoomId)
    .filter((id): id is string => Boolean(id));

  const [memberCount, channelCount, messageCount] = await Promise.all([
    prisma.communityMember.count({
      where: { communityId, leftAt: null, isBanned: false },
    }),
    prisma.communityChannel.count({ where: { communityId } }),
    roomIds.length
      ? prisma.message.count({
          where: {
            roomId: { in: roomIds },
            deletedAt: null,
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        })
      : Promise.resolve(0),
  ]);

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { ownerId: true, name: true },
  });

  if (!community) {
    return;
  }

  const statsMessage = [
    `📊 ${community.name} — Sunucu İstatistikleri`,
    `👥 Üye: ${memberCount}`,
    `📁 Kanal: ${channelCount}`,
    `💬 Son 24s mesaj: ${messageCount}`,
  ].join("\n");

  const recent = await prisma.message.findFirst({
    where: { roomId: channel.backingRoomId, deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (recent?.content.startsWith("📊")) {
    await prisma.message.update({
      where: { id: recent.id },
      data: { content: statsMessage },
    });
    return;
  }

  await prisma.message.create({
    data: {
      roomId: channel.backingRoomId,
      senderId: community.ownerId,
      content: statsMessage,
    },
  });
}
