import {
  ChannelType,
  ChannelVisibility,
  CommunityCategory,
  CommunityMemberRole,
  CommunityVisibility,
  RoomCategory,
  RoomType,
  type Prisma,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";
import { createUniqueInviteCode } from "../../utils/generateInviteCode";
import { trimAndLimit } from "../../utils/sanitizeInput";
import { createUniqueSlug } from "../../utils/slugify";
import {
  clampLimit,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
  buildOlderThanCursorFilter,
} from "../../utils/pagination";
import { publicUserSelect } from "../../utils/prismaSelects";
import {
  assertCommunityPermission,
  canViewChannel,
  canViewCommunity,
  defaultPermissionsForChannelType,
  getActiveCommunityMember,
  getCommunityMemberOrNull,
  hasCommunityRoleAtLeast,
  mapCommunityRoleToRoomRole,
  canManageCommunityMember,
  getUserEffectivePermissions,
} from "../../utils/communityPermissions";
import {
  assignDefaultMemberRole,
  ensureDefaultRoles,
  hasServerPermission,
} from "../../utils/communityRoleEngine";
import {
  DEFAULT_SELECTED_BOTS,
  DEFAULT_SELECTED_CHANNELS,
} from "../../constants/communitySetup";
import type {
  CreateChannelInput,
  CreateCommunityInput,
  ListCommunitiesQuery,
  UpdateChannelInput,
  UpdateCommunityInput,
  UpdateMemberInput,
  CreateCommunityInviteInput,
  ChannelPermissionInput,
} from "./community.schemas";

const DEFAULT_CHANNELS: Array<{
  name: string;
  slug: string;
  type: ChannelType;
}> = [
  { name: "genel", slug: "genel", type: ChannelType.TEXT },
  { name: "birlikte-izle", slug: "birlikte-izle", type: ChannelType.WATCH },
  { name: "sesli-sohbet", slug: "sesli-sohbet", type: ChannelType.VOICE },
  { name: "duyurular", slug: "duyurular", type: ChannelType.ANNOUNCEMENT },
];

function formatCommunityListItem(
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    avatarUrl: string | null;
    visibility: CommunityVisibility;
    category: CommunityCategory;
    ownerId: string;
    createdAt: Date;
    _count?: { members: number; channels: number };
  },
  isMember: boolean,
) {
  return {
    id: community.id,
    name: community.name,
    slug: community.slug,
    description: community.description,
    avatarUrl: community.avatarUrl,
    visibility: community.visibility,
    category: community.category,
    ownerId: community.ownerId,
    memberCount: community._count?.members ?? 0,
    channelCount: community._count?.channels ?? 0,
    isMember,
    createdAt: community.createdAt.toISOString(),
  };
}

function formatChannel(
  channel: Prisma.CommunityChannelGetPayload<{ include: { permissions: true } }>,
) {
  return {
    id: channel.id,
    communityId: channel.communityId,
    name: channel.name,
    slug: channel.slug,
    description: channel.description,
    type: channel.type,
    visibility: channel.visibility,
    position: channel.position,
    backingRoomId: channel.backingRoomId,
    permissions: channel.permissions
      ? {
          minRoleView: channel.permissions.minRoleView,
          minRoleSend: channel.permissions.minRoleSend,
          minRoleWatchStart: channel.permissions.minRoleWatchStart,
          minRoleWatchControl: channel.permissions.minRoleWatchControl,
          minRoleVoice: channel.permissions.minRoleVoice,
          minRoleVideo: channel.permissions.minRoleVideo,
        }
      : null,
    createdAt: channel.createdAt.toISOString(),
    updatedAt: channel.updatedAt.toISOString(),
  };
}

async function createUniqueCommunitySlug(name: string) {
  return createUniqueSlug(name, async (candidate) => {
    const existing = await prisma.community.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });
}

async function createUniqueChannelSlug(communityId: string, name: string) {
  return createUniqueSlug(name, async (candidate) => {
    const existing = await prisma.communityChannel.findFirst({
      where: { communityId, slug: candidate },
    });
    return Boolean(existing);
  });
}

async function createBackingRoom(
  tx: Prisma.TransactionClient,
  params: {
    communityId: string;
    channelName: string;
    channelSlug: string;
    ownerId: string;
  },
) {
  const roomSlug = await createUniqueSlug(
    `community-${params.communityId}-${params.channelSlug}`,
    async (candidate) => {
      const existing = await prisma.room.findUnique({ where: { slug: candidate } });
      return Boolean(existing);
    },
  );
  const inviteCode = await createUniqueInviteCode();

  return tx.room.create({
    data: {
      name: params.channelName,
      slug: roomSlug,
      description: null,
      category: RoomCategory.CHAT,
      type: RoomType.PRIVATE,
      ownerId: params.ownerId,
      maxUserCount: 500,
      inviteCode,
      inviteEnabled: false,
      isCommunityBacking: true,
      currentUserCount: 0,
    },
  });
}

async function syncMemberToBackingRoom(
  tx: Prisma.TransactionClient,
  params: {
    backingRoomId: string;
    userId: string;
    communityOwnerId: string;
    communityRole: CommunityMemberRole;
  },
) {
  const roomRole = mapCommunityRoleToRoomRole(
    params.communityRole,
    params.communityOwnerId,
    params.userId,
  );

  const existing = await tx.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId: params.backingRoomId,
        userId: params.userId,
      },
    },
  });

  if (existing) {
    if (existing.leftAt !== null) {
      await tx.roomMember.update({
        where: { id: existing.id },
        data: {
          leftAt: null,
          role: roomRole,
          isBanned: false,
        },
      });
      await tx.room.update({
        where: { id: params.backingRoomId },
        data: { currentUserCount: { increment: 1 } },
      });
    }
    return;
  }

  await tx.roomMember.create({
    data: {
      roomId: params.backingRoomId,
      userId: params.userId,
      role: roomRole,
    },
  });

  await tx.room.update({
    where: { id: params.backingRoomId },
    data: { currentUserCount: { increment: 1 } },
  });
}

async function syncAllMembersToBackingRoom(
  communityId: string,
  backingRoomId: string,
  ownerId: string,
) {
  const members = await prisma.communityMember.findMany({
    where: { communityId, leftAt: null, isBanned: false },
  });

  await prisma.$transaction(async (tx) => {
    for (const member of members) {
      await syncMemberToBackingRoom(tx, {
        backingRoomId,
        userId: member.userId,
        communityOwnerId: ownerId,
        communityRole: member.role,
      });
    }
  });
}

function resolvePermissionInput(
  type: ChannelType,
  input?: ChannelPermissionInput,
) {
  const defaults = defaultPermissionsForChannelType(type);
  return {
    minRoleView: input?.minRoleView ?? defaults.minRoleView,
    minRoleSend: input?.minRoleSend ?? defaults.minRoleSend,
    minRoleWatchStart: input?.minRoleWatchStart ?? defaults.minRoleWatchStart,
    minRoleWatchControl: input?.minRoleWatchControl ?? defaults.minRoleWatchControl,
    minRoleVoice: input?.minRoleVoice ?? defaults.minRoleVoice,
    minRoleVideo: input?.minRoleVideo ?? defaults.minRoleVideo,
  };
}

export async function createCommunityChannelInternal(
  communityId: string,
  userId: string,
  input: CreateChannelInput,
  position?: number,
  skipPermissionCheck = false,
) {
  const member = await getActiveCommunityMember(communityId, userId);
  if (!skipPermissionCheck) {
    await assertCommunityPermission(member, "channel.create");
  }

  const community = await prisma.community.findUnique({ where: { id: communityId } });

  if (!community) {
    throw new AppError(404, "Topluluk bulunamadı");
  }

  const channelName = trimAndLimit(input.name, 60);

  if (channelName.length < 2) {
    throw new AppError(400, "Kanal adı en az 2 karakter olmalı");
  }

  const slug = await createUniqueChannelSlug(communityId, channelName);
  const nextPosition =
    position ??
    ((await prisma.communityChannel.aggregate({
      where: { communityId },
      _max: { position: true },
    }))._max.position ?? -1) + 1;

  const channel = await prisma.$transaction(async (tx) => {
    const backingRoom = await createBackingRoom(tx, {
      communityId,
      channelName,
      channelSlug: slug,
      ownerId: community.ownerId,
    });

    const created = await tx.communityChannel.create({
      data: {
        communityId,
        name: channelName,
        slug,
        description: input.description ? trimAndLimit(input.description, 240) : null,
        type: input.type,
        visibility: input.visibility ?? ChannelVisibility.PUBLIC,
        position: nextPosition,
        backingRoomId: backingRoom.id,
        createdById: userId,
        permissions: {
          create: resolvePermissionInput(input.type, input.permissions),
        },
      },
      include: { permissions: true },
    });

    await syncMemberToBackingRoom(tx, {
      backingRoomId: backingRoom.id,
      userId: community.ownerId,
      communityOwnerId: community.ownerId,
      communityRole: CommunityMemberRole.OWNER,
    });

    const members = await tx.communityMember.findMany({
      where: { communityId, leftAt: null, isBanned: false },
    });

    for (const communityMember of members) {
      if (communityMember.userId === community.ownerId) {
        continue;
      }

      await syncMemberToBackingRoom(tx, {
        backingRoomId: backingRoom.id,
        userId: communityMember.userId,
        communityOwnerId: community.ownerId,
        communityRole: communityMember.role,
      });
    }

    return created;
  });

  return formatChannel(channel);
}

export async function listCommunities(query: ListCommunitiesQuery, userId?: string) {
  const limit = clampLimit(query.limit, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
  const cursorCommunity = query.cursor
    ? await prisma.community.findFirst({
        where: { id: query.cursor },
        select: { id: true, createdAt: true },
      })
    : null;

  const communities = await prisma.community.findMany({
    where: {
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(query.visibility ? { visibility: query.visibility } : {}),
      ...buildOlderThanCursorFilter(cursorCommunity),
    },
    include: {
      _count: {
        select: {
          members: { where: { leftAt: null, isBanned: false } },
          channels: true,
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = communities.length > limit;
  const page = hasMore ? communities.slice(0, limit) : communities;

  let memberCommunityIds = new Set<string>();

  if (userId && page.length > 0) {
    const memberships = await prisma.communityMember.findMany({
      where: {
        userId,
        leftAt: null,
        isBanned: false,
        communityId: { in: page.map((item) => item.id) },
      },
      select: { communityId: true },
    });
    memberCommunityIds = new Set(memberships.map((item) => item.communityId));
  }

  const visible = [];

  for (const community of page) {
    const canView = await canViewCommunity(community, userId);

    if (canView) {
      visible.push(
        formatCommunityListItem(community, memberCommunityIds.has(community.id)),
      );
    }
  }

  return {
    communities: visible,
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
  };
}

export async function createCommunity(ownerId: string, input: CreateCommunityInput) {
  const name = trimAndLimit(input.name, 80);

  if (name.length < 3) {
    throw new AppError(400, "Topluluk adı en az 3 karakter olmalı");
  }

  const slug = await createUniqueCommunitySlug(name);

  const community = await prisma.$transaction(async (tx) => {
    const created = await tx.community.create({
      data: {
        name,
        slug,
        description: input.description ? trimAndLimit(input.description, 500) : null,
        avatarUrl: input.avatarUrl ?? null,
        visibility: input.visibility ?? CommunityVisibility.PUBLIC,
        category: input.category ?? CommunityCategory.GENERAL,
        ownerId,
      },
    });

    await tx.communityMember.create({
      data: {
        communityId: created.id,
        userId: ownerId,
        role: CommunityMemberRole.OWNER,
      },
    });

    return created;
  });

  await ensureDefaultRoles(community.id);

  await prisma.communitySetupTemplate.create({
    data: {
      communityId: community.id,
      selectedChannels: DEFAULT_SELECTED_CHANNELS,
      selectedBots: DEFAULT_SELECTED_BOTS,
    },
  });

  const { initializeCommunityBots } = await import("./communityBot.service");
  await initializeCommunityBots(community.id);

  return getCommunityById(community.id, ownerId);
}

export async function getCommunityById(communityId: string, userId?: string) {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      owner: { select: publicUserSelect },
      members: {
        where: { leftAt: null, isBanned: false },
        include: { user: { select: publicUserSelect } },
        orderBy: { joinedAt: "asc" },
        take: 200,
      },
      channels: {
        include: { permissions: true },
        orderBy: { position: "asc" },
      },
      _count: {
        select: {
          members: { where: { leftAt: null, isBanned: false } },
        },
      },
    },
  });

  if (!community) {
    throw new AppError(404, "Topluluk bulunamadı");
  }

  const canView = await canViewCommunity(community, userId);

  if (!canView) {
    throw new AppError(403, "Bu topluluğu görüntüleme yetkiniz yok");
  }

  const membership = userId
    ? await getCommunityMemberOrNull(communityId, userId)
    : null;

  const activeMembership =
    membership && membership.leftAt === null && !membership.isBanned
      ? membership
      : null;

  const visibleChannels = [];

  for (const channel of community.channels) {
    if (await canViewChannel(channel, activeMembership, userId)) {
      visibleChannels.push(formatChannel(channel));
    }
  }

  const canManageSettings = userId
    ? await hasServerPermission(userId, communityId, "server.edit")
    : false;
  const canManageRoles = userId
    ? await hasServerPermission(userId, communityId, "server.manage_roles")
    : false;
  const canViewMembers = userId
    ? await hasServerPermission(userId, communityId, "server.view_members")
    : false;

  return {
    community: {
      id: community.id,
      name: community.name,
      slug: community.slug,
      description: community.description,
      avatarUrl: community.avatarUrl,
      visibility: community.visibility,
      category: community.category,
      ownerId: community.ownerId,
      memberCount: community._count.members,
      setupCompleted: community.setupCompleted,
      createdAt: community.createdAt.toISOString(),
      updatedAt: community.updatedAt.toISOString(),
    },
    owner: community.owner,
    channels: visibleChannels,
    members: community.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      user: member.user,
    })),
    isMember: Boolean(activeMembership),
    currentUserRole: activeMembership?.role ?? null,
    canManageSettings,
    canManageRoles,
    canViewMembers,
  };
}

export async function updateCommunity(
  communityId: string,
  userId: string,
  input: UpdateCommunityInput,
) {
  const member = await getActiveCommunityMember(communityId, userId);
  await assertCommunityPermission(member, "community.update");

  const updated = await prisma.community.update({
    where: { id: communityId },
    data: {
      ...(input.name !== undefined
        ? { name: trimAndLimit(input.name, 80) }
        : {}),
      ...(input.description !== undefined
        ? {
            description: input.description
              ? trimAndLimit(input.description, 500)
              : null,
          }
        : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      ...(input.category !== undefined ? { category: input.category } : {}),
    },
  });

  return getCommunityById(updated.id, userId);
}

export async function deleteCommunity(communityId: string, userId: string) {
  const member = await getActiveCommunityMember(communityId, userId);
  await assertCommunityPermission(member, "community.delete");

  await prisma.community.delete({ where: { id: communityId } });

  return { message: "Topluluk silindi" };
}

export async function joinCommunity(communityId: string, userId: string) {
  const community = await prisma.community.findUnique({ where: { id: communityId } });

  if (!community) {
    throw new AppError(404, "Topluluk bulunamadı");
  }

  if (community.visibility === CommunityVisibility.PRIVATE) {
    throw new AppError(403, "Bu topluluğa yalnızca davet ile katılabilirsiniz");
  }

  const existing = await getCommunityMemberOrNull(communityId, userId);

  if (existing?.isBanned) {
    throw new AppError(403, "Bu topluluktan banlandınız");
  }

  let memberId: string;

  await prisma.$transaction(async (tx) => {
    if (existing) {
      const updated = await tx.communityMember.update({
        where: { id: existing.id },
        data: {
          leftAt: null,
          role:
            existing.role === CommunityMemberRole.OWNER
              ? CommunityMemberRole.OWNER
              : CommunityMemberRole.MEMBER,
        },
      });
      memberId = updated.id;
    } else {
      const created = await tx.communityMember.create({
        data: {
          communityId,
          userId,
          role: CommunityMemberRole.MEMBER,
        },
      });
      memberId = created.id;
    }
  });

  await assignDefaultMemberRole(communityId, memberId!, CommunityMemberRole.MEMBER);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });

  if (user && community.setupCompleted) {
    const { handleMemberJoinedWelcome } = await import("../../utils/botRuntime/welcomeBot");
    await handleMemberJoinedWelcome(communityId, memberId!, userId, user.username);
  }

  const channels = await prisma.communityChannel.findMany({
    where: { communityId },
    select: { backingRoomId: true },
  });

  for (const channel of channels) {
    if (!channel.backingRoomId) {
      continue;
    }

    await syncAllMembersToBackingRoom(communityId, channel.backingRoomId, community.ownerId);
  }

  return getCommunityById(communityId, userId);
}

export async function leaveCommunity(communityId: string, userId: string) {
  const member = await getActiveCommunityMember(communityId, userId);

  if (member.role === CommunityMemberRole.OWNER) {
    throw new AppError(400, "Topluluk sahibi ayrılamaz. Önce topluluğu silin veya devredin.");
  }

  await prisma.communityMember.update({
    where: { id: member.id },
    data: { leftAt: new Date() },
  });

  const channels = await prisma.communityChannel.findMany({
    where: { communityId },
    select: { backingRoomId: true },
  });

  for (const channel of channels) {
    if (!channel.backingRoomId) {
      continue;
    }

    const roomMember = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: {
          roomId: channel.backingRoomId,
          userId,
        },
      },
    });

    if (roomMember && roomMember.leftAt === null) {
      await prisma.roomMember.update({
        where: { id: roomMember.id },
        data: { leftAt: new Date() },
      });
    }
  }

  return { message: "Topluluktan ayrıldınız" };
}

export async function listCommunityMembers(communityId: string, userId: string) {
  await getActiveCommunityMember(communityId, userId);

  const members = await prisma.communityMember.findMany({
    where: { communityId, leftAt: null, isBanned: false },
    include: { user: { select: publicUserSelect } },
    orderBy: { joinedAt: "asc" },
  });

  return {
    members: members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      user: member.user,
    })),
  };
}

export async function updateCommunityMember(
  communityId: string,
  actorUserId: string,
  memberId: string,
  input: UpdateMemberInput,
) {
  const actor = await getActiveCommunityMember(communityId, actorUserId);
  await assertCommunityPermission(actor, "member.kick");

  const target = await prisma.communityMember.findFirst({
    where: { id: memberId, communityId },
  });

  if (!target || target.leftAt !== null) {
    throw new AppError(404, "Üye bulunamadı");
  }

  if (!canManageCommunityMember(actor, target)) {
    throw new AppError(403, "Bu üyeyi yönetme yetkiniz yok");
  }

  if (input.role && input.role === CommunityMemberRole.OWNER) {
    throw new AppError(400, "Owner rolü atanamaz");
  }

  const updated = await prisma.communityMember.update({
    where: { id: target.id },
    data: {
      ...(input.role ? { role: input.role } : {}),
    },
    include: { user: { select: publicUserSelect } },
  });

  if (input.role) {
    await ensureDefaultRoles(communityId);
    const systemRole = await prisma.communityRole.findFirst({
      where: { communityId, systemKey: input.role },
    });

    if (systemRole && !systemRole.isOwnerRole) {
      await prisma.communityMemberRoleAssignment.upsert({
        where: {
          memberId_roleId: {
            memberId: target.id,
            roleId: systemRole.id,
          },
        },
        create: {
          memberId: target.id,
          roleId: systemRole.id,
          assignedById: actorUserId,
        },
        update: {
          assignedById: actorUserId,
        },
      });
    }
  }

  return {
    member: {
      id: updated.id,
      userId: updated.userId,
      role: updated.role,
      joinedAt: updated.joinedAt.toISOString(),
      user: updated.user,
    },
  };
}

export async function removeCommunityMember(
  communityId: string,
  actorUserId: string,
  memberId: string,
) {
  const actor = await getActiveCommunityMember(communityId, actorUserId);
  await assertCommunityPermission(actor, "member.kick");

  const target = await prisma.communityMember.findFirst({
    where: { id: memberId, communityId },
  });

  if (!target || target.leftAt !== null) {
    throw new AppError(404, "Üye bulunamadı");
  }

  if (!canManageCommunityMember(actor, target)) {
    throw new AppError(403, "Bu üyeyi çıkarma yetkiniz yok");
  }

  await prisma.communityMember.update({
    where: { id: target.id },
    data: {
      leftAt: new Date(),
      ...(actor.role === CommunityMemberRole.OWNER ||
      actor.role === CommunityMemberRole.ADMIN
        ? { isBanned: true, bannedAt: new Date() }
        : {}),
    },
  });

  return { message: "Üye topluluktan çıkarıldı" };
}

export async function listCommunityChannels(communityId: string, userId?: string) {
  const detail = await getCommunityById(communityId, userId);
  return { channels: detail.channels };
}

export async function createCommunityChannel(
  communityId: string,
  userId: string,
  input: CreateChannelInput,
) {
  const channel = await createCommunityChannelInternal(communityId, userId, input);
  return { channel };
}

export async function getCommunityChannelById(
  communityId: string,
  channelId: string,
  userId?: string,
) {
  const community = await getCommunityById(communityId, userId);
  const channel = community.channels.find((item) => item.id === channelId);

  if (!channel) {
    throw new AppError(404, "Kanal bulunamadı");
  }

  return {
    channel,
    community: community.community,
    isMember: community.isMember,
    currentUserRole: community.currentUserRole,
    members: community.members,
  };
}

export async function updateCommunityChannel(
  communityId: string,
  channelId: string,
  userId: string,
  input: UpdateChannelInput,
) {
  const member = await getActiveCommunityMember(communityId, userId);
  await assertCommunityPermission(member, "channel.update");

  const existing = await prisma.communityChannel.findFirst({
    where: { id: channelId, communityId },
    include: { permissions: true },
  });

  if (!existing) {
    throw new AppError(404, "Kanal bulunamadı");
  }

  const updated = await prisma.communityChannel.update({
    where: { id: channelId },
    data: {
      ...(input.name !== undefined ? { name: trimAndLimit(input.name, 60) } : {}),
      ...(input.description !== undefined
        ? {
            description: input.description
              ? trimAndLimit(input.description, 240)
              : null,
          }
        : {}),
      ...(input.visibility !== undefined ? { visibility: input.visibility } : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.permissions
        ? {
            permissions: {
              upsert: {
                create: resolvePermissionInput(existing.type, input.permissions),
                update: resolvePermissionInput(existing.type, input.permissions),
              },
            },
          }
        : {}),
    },
    include: { permissions: true },
  });

  return { channel: formatChannel(updated) };
}

export async function deleteCommunityChannel(
  communityId: string,
  channelId: string,
  userId: string,
) {
  const member = await getActiveCommunityMember(communityId, userId);
  await assertCommunityPermission(member, "channel.delete");

  const channel = await prisma.communityChannel.findFirst({
    where: { id: channelId, communityId },
  });

  if (!channel) {
    throw new AppError(404, "Kanal bulunamadı");
  }

  await prisma.communityChannel.delete({ where: { id: channelId } });

  return { message: "Kanal silindi" };
}

export async function createCommunityInvite(
  communityId: string,
  userId: string,
  input: CreateCommunityInviteInput,
) {
  const member = await getActiveCommunityMember(communityId, userId);
  await assertCommunityPermission(member, "member.invite");

  const code = await createUniqueInviteCode();

  const invite = await prisma.communityInvite.create({
    data: {
      communityId,
      code,
      createdById: userId,
      expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
      maxUses: input.maxUses ?? null,
    },
  });

  return {
    invite: {
      id: invite.id,
      code: invite.code,
      expiresAt: invite.expiresAt?.toISOString() ?? null,
      maxUses: invite.maxUses,
      usedCount: invite.usedCount,
      isActive: invite.isActive,
      createdAt: invite.createdAt.toISOString(),
    },
  };
}

export async function listCommunityInvites(communityId: string, userId: string) {
  const member = await getActiveCommunityMember(communityId, userId);
  await assertCommunityPermission(member, "member.invite");

  const invites = await prisma.communityInvite.findMany({
    where: { communityId },
    orderBy: { createdAt: "desc" },
  });

  return {
    invites: invites.map((invite) => ({
      id: invite.id,
      code: invite.code,
      expiresAt: invite.expiresAt?.toISOString() ?? null,
      maxUses: invite.maxUses,
      usedCount: invite.usedCount,
      isActive: invite.isActive,
      createdAt: invite.createdAt.toISOString(),
    })),
  };
}

export async function revokeCommunityInvite(
  communityId: string,
  inviteId: string,
  userId: string,
) {
  const member = await getActiveCommunityMember(communityId, userId);
  await assertCommunityPermission(member, "member.invite");

  const invite = await prisma.communityInvite.findFirst({
    where: { id: inviteId, communityId },
  });

  if (!invite) {
    throw new AppError(404, "Davet bulunamadı");
  }

  await prisma.communityInvite.update({
    where: { id: invite.id },
    data: { isActive: false },
  });

  return { message: "Davet iptal edildi" };
}

export async function getCommunityInvitePreview(code: string) {
  const invite = await prisma.communityInvite.findUnique({
    where: { code },
    include: {
      community: {
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          avatarUrl: true,
          visibility: true,
          category: true,
        },
      },
    },
  });

  if (!invite || !invite.isActive) {
    throw new AppError(404, "Davet geçersiz veya iptal edilmiş");
  }

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new AppError(410, "Davet süresi dolmuş");
  }

  if (invite.maxUses !== null && invite.usedCount >= invite.maxUses) {
    throw new AppError(410, "Davet kullanım limitine ulaşılmış");
  }

  return {
    invite: {
      code: invite.code,
      community: invite.community,
    },
  };
}

export async function acceptCommunityInvite(code: string, userId: string) {
  const preview = await getCommunityInvitePreview(code);

  const existing = await getCommunityMemberOrNull(preview.invite.community.id, userId);

  if (existing?.isBanned) {
    throw new AppError(403, "Bu topluluktan banlandınız");
  }

  await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.communityMember.update({
        where: { id: existing.id },
        data: { leftAt: null, isBanned: false, bannedAt: null },
      });
    } else {
      await tx.communityMember.create({
        data: {
          communityId: preview.invite.community.id,
          userId,
          role: CommunityMemberRole.MEMBER,
        },
      });
    }

    await tx.communityInvite.update({
      where: { code },
      data: { usedCount: { increment: 1 } },
    });
  });

  const community = await prisma.community.findUnique({
    where: { id: preview.invite.community.id },
  });

  if (community) {
    const channels = await prisma.communityChannel.findMany({
      where: { communityId: community.id },
      select: { backingRoomId: true },
    });

    for (const channel of channels) {
      if (channel.backingRoomId) {
        await syncAllMembersToBackingRoom(
          community.id,
          channel.backingRoomId,
          community.ownerId,
        );
      }
    }
  }

  return getCommunityById(preview.invite.community.id, userId);
}
