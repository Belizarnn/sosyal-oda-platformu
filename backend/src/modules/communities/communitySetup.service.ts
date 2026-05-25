import {
  ChannelType,
  ChannelVisibility,
  CommunityBotType,
  CommunityMemberRole,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";
import {
  BOT_EXTRA_CHANNELS,
  BOT_SUGGESTED_CHANNELS,
  CHANNEL_TEMPLATE_DEFINITIONS,
  DEFAULT_SELECTED_BOTS,
  DEFAULT_SELECTED_CHANNELS,
  type ChannelTemplateKey,
} from "../../constants/communitySetup";
import { getActiveCommunityMember } from "../../utils/communityPermissions";
import { ensureDefaultRoles } from "../../utils/communityRoleEngine";
import { initializeCommunityBots } from "./communityBot.service";
import { postCommunityLogMessage } from "../../utils/botRuntime/logBot";
import { seedReactionRolePanel } from "../../utils/botRuntime/reactionRoleBot";
import { updateStatsChannel } from "../../utils/botRuntime/statsBot";

export async function assertCommunityOwner(communityId: string, userId: string) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });

  if (!community) {
    throw new AppError(404, "Topluluk bulunamadı");
  }

  if (community.ownerId !== userId) {
    const member = await getActiveCommunityMember(communityId, userId);
    if (member.role !== CommunityMemberRole.OWNER) {
      throw new AppError(403, "Kurulumu yalnızca sunucu sahibi tamamlayabilir");
    }
  }
}

export async function getCommunitySetup(communityId: string, userId: string) {
  await getActiveCommunityMember(communityId, userId);

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: { setupTemplate: true },
  });

  if (!community) {
    throw new AppError(404, "Topluluk bulunamadı");
  }

  let template = community.setupTemplate;

  if (!template) {
    template = await prisma.communitySetupTemplate.create({
      data: {
        communityId,
        selectedChannels: DEFAULT_SELECTED_CHANNELS,
        selectedBots: DEFAULT_SELECTED_BOTS,
      },
    });
  }

  return {
    setupCompleted: community.setupCompleted,
    selectedChannels: template.selectedChannels as ChannelTemplateKey[],
    selectedBots: template.selectedBots as Record<string, boolean>,
    channelTemplates: CHANNEL_TEMPLATE_DEFINITIONS,
  };
}

export async function saveSetupChannels(
  communityId: string,
  userId: string,
  selectedChannels: ChannelTemplateKey[],
) {
  await assertCommunityOwner(communityId, userId);

  const community = await prisma.community.findUnique({ where: { id: communityId } });

  if (!community) {
    throw new AppError(404, "Topluluk bulunamadı");
  }

  if (community.setupCompleted) {
    throw new AppError(400, "Kurulum zaten tamamlandı");
  }

  for (const key of selectedChannels) {
    if (!CHANNEL_TEMPLATE_DEFINITIONS[key]) {
      throw new AppError(400, `Geçersiz kanal şablonu: ${key}`);
    }
  }

  await prisma.communitySetupTemplate.upsert({
    where: { communityId },
    create: {
      communityId,
      selectedChannels,
      selectedBots: DEFAULT_SELECTED_BOTS,
    },
    update: { selectedChannels },
  });

  return getCommunitySetup(communityId, userId);
}

export async function saveSetupBots(
  communityId: string,
  userId: string,
  selectedBots: Record<string, boolean>,
) {
  await assertCommunityOwner(communityId, userId);

  const community = await prisma.community.findUnique({ where: { id: communityId } });

  if (!community) {
    throw new AppError(404, "Topluluk bulunamadı");
  }

  if (community.setupCompleted) {
    throw new AppError(400, "Kurulum zaten tamamlandı");
  }

  await prisma.communitySetupTemplate.upsert({
    where: { communityId },
    create: {
      communityId,
      selectedChannels: DEFAULT_SELECTED_CHANNELS,
      selectedBots,
    },
    update: { selectedBots },
  });

  return getCommunitySetup(communityId, userId);
}

async function createSetupChannel(
  communityId: string,
  ownerId: string,
  template: { name: string; slug: string; type: ChannelType },
  position: number,
) {
  const existing = await prisma.communityChannel.findFirst({
    where: { communityId, slug: template.slug },
  });

  if (existing) {
    return existing;
  }

  const { createCommunityChannelInternal } = await import("./community.service");
  const result = await createCommunityChannelInternal(
    communityId,
    ownerId,
    {
      name: template.name,
      type: template.type,
      visibility: ChannelVisibility.PUBLIC,
    },
    position,
    true,
  );

  return result;
}

function resolveFinalChannels(
  selectedChannels: ChannelTemplateKey[],
  selectedBots: Record<string, boolean>,
): Array<{ name: string; slug: string; type: ChannelType }> {
  const channelKeys = new Set(selectedChannels);

  for (const [botType, enabled] of Object.entries(selectedBots)) {
    if (!enabled) {
      continue;
    }

    const suggested = BOT_SUGGESTED_CHANNELS[botType as CommunityBotType] ?? [];
    for (const key of suggested) {
      channelKeys.add(key);
    }

    if (botType === CommunityBotType.REACTION_ROLE) {
      channelKeys.add("chat");
    }
  }

  const channels: Array<{ name: string; slug: string; type: ChannelType }> = [];

  for (const key of channelKeys) {
    const def = CHANNEL_TEMPLATE_DEFINITIONS[key];
    if (def) {
      channels.push({ name: def.name, slug: def.slug, type: def.type });
    }
  }

  if (selectedBots.REACTION_ROLE) {
    channels.push(BOT_EXTRA_CHANNELS["rol-secim"]);
  }

  const seen = new Set<string>();
  return channels.filter((channel) => {
    if (seen.has(channel.slug)) {
      return false;
    }
    seen.add(channel.slug);
    return true;
  });
}

export async function completeCommunitySetup(communityId: string, userId: string) {
  await assertCommunityOwner(communityId, userId);

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: { setupTemplate: true },
  });

  if (!community) {
    throw new AppError(404, "Topluluk bulunamadı");
  }

  if (community.setupCompleted) {
    throw new AppError(400, "Kurulum zaten tamamlandı");
  }

  const template = community.setupTemplate ?? (await prisma.communitySetupTemplate.create({
    data: {
      communityId,
      selectedChannels: DEFAULT_SELECTED_CHANNELS,
      selectedBots: DEFAULT_SELECTED_BOTS,
    },
  }));

  const selectedChannels = (template.selectedChannels as ChannelTemplateKey[]) ?? DEFAULT_SELECTED_CHANNELS;
  const selectedBots = (template.selectedBots as Record<string, boolean>) ?? DEFAULT_SELECTED_BOTS;

  await ensureDefaultRoles(communityId);
  await initializeCommunityBots(communityId);

  const channelsToCreate = resolveFinalChannels(selectedChannels, selectedBots);

  for (let index = 0; index < channelsToCreate.length; index += 1) {
    await createSetupChannel(communityId, community.ownerId, channelsToCreate[index], index);
  }

  for (const botType of Object.values(CommunityBotType)) {
    const enabled = Boolean(selectedBots[botType]);
    await prisma.communityBot.updateMany({
      where: { communityId, type: botType },
      data: { enabled },
    });
  }

  if (selectedBots.LOG) {
    await postCommunityLogMessage(
      communityId,
      "Sunucu kurulumu tamamlandı. Log botu aktif.",
      "setup_complete",
    );
  }

  if (selectedBots.STATS) {
    await updateStatsChannel(communityId);
  }

  if (selectedBots.REACTION_ROLE) {
    await seedReactionRolePanel(communityId);
  }

  await prisma.community.update({
    where: { id: communityId },
    data: { setupCompleted: true },
  });

  await prisma.communitySetupTemplate.update({
    where: { communityId },
    data: { completedAt: new Date() },
  });

  const { getCommunityById } = await import("./community.service");
  return getCommunityById(communityId, userId);
}
