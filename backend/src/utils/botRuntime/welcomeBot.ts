import { CommunityBotType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { getEnabledBot } from "../communityBotUtils";
import { postCommunityLogMessage } from "./logBot";
import { assignDefaultMemberRole } from "../communityRoleEngine";

export async function handleMemberJoinedWelcome(
  communityId: string,
  memberId: string,
  userId: string,
  username: string,
) {
  const bot = await getEnabledBot(communityId, CommunityBotType.WELCOME);
  if (!bot) {
    return;
  }

  const settings = bot.settings as {
    welcomeChannelSlug?: string;
    welcomeMessage?: string;
    autoRoleSystemKey?: string;
    dmWelcome?: boolean;
  };

  const welcomeMessage = (settings.welcomeMessage ?? "Hoş geldin {user}!").replace(
    "{user}",
    username,
  );

  const channel = await prisma.communityChannel.findFirst({
    where: {
      communityId,
      slug: settings.welcomeChannelSlug ?? "sohbet",
    },
    select: { backingRoomId: true },
  });

  if (channel?.backingRoomId) {
    const community = await prisma.community.findUnique({
      where: { id: communityId },
      select: { ownerId: true },
    });

    if (community) {
      await prisma.message.create({
        data: {
          roomId: channel.backingRoomId,
          senderId: community.ownerId,
          content: `[HOŞ GELDİN] ${welcomeMessage}`,
        },
      });
    }
  }

  if (settings.autoRoleSystemKey) {
    await assignDefaultMemberRole(communityId, memberId);
  }

  await postCommunityLogMessage(
    communityId,
    `${username} sunucuya katıldı`,
    "member_join",
    { userId },
  );
}

export async function handleMemberLeftWelcome(
  communityId: string,
  username: string,
) {
  const bot = await getEnabledBot(communityId, CommunityBotType.WELCOME);
  if (!bot) {
    return;
  }

  const settings = bot.settings as { leaveMessage?: string };
  const leaveMessage = (settings.leaveMessage ?? "{user} ayrıldı").replace("{user}", username);

  await postCommunityLogMessage(communityId, leaveMessage, "member_leave", { username });
}
