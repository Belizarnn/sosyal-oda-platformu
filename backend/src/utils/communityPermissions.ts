import {
  ChannelType,
  ChannelVisibility,
  CommunityMemberRole,
  CommunityVisibility,
  RoomMemberRole,
  type ChannelPermission,
  type Community,
  type CommunityChannel,
  type CommunityMember,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "./asyncHandler";

export type CommunityPermission =
  | "community.update"
  | "community.delete"
  | "member.invite"
  | "member.kick"
  | "member.ban"
  | "channel.create"
  | "channel.update"
  | "channel.delete"
  | "message.send"
  | "message.delete"
  | "announcement.send"
  | "watch.start"
  | "watch.control"
  | "voice.join"
  | "video.join";

const ROLE_RANK: Record<CommunityMemberRole, number> = {
  GUEST: 0,
  MEMBER: 1,
  MODERATOR: 2,
  ADMIN: 3,
  OWNER: 4,
};

const ROLE_PERMISSIONS: Record<CommunityMemberRole, Set<CommunityPermission>> = {
  GUEST: new Set(),
  MEMBER: new Set(["message.send", "watch.start", "voice.join", "video.join"]),
  MODERATOR: new Set([
    "message.send",
    "message.delete",
    "announcement.send",
    "watch.start",
    "watch.control",
    "voice.join",
    "video.join",
    "member.kick",
    "channel.create",
    "channel.update",
    "member.invite",
  ]),
  ADMIN: new Set([
    "community.update",
    "member.invite",
    "member.kick",
    "member.ban",
    "channel.create",
    "channel.update",
    "channel.delete",
    "message.send",
    "message.delete",
    "announcement.send",
    "watch.start",
    "watch.control",
    "voice.join",
    "video.join",
  ]),
  OWNER: new Set([
    "community.update",
    "community.delete",
    "member.invite",
    "member.kick",
    "member.ban",
    "channel.create",
    "channel.update",
    "channel.delete",
    "message.send",
    "message.delete",
    "announcement.send",
    "watch.start",
    "watch.control",
    "voice.join",
    "video.join",
  ]),
};

export function hasCommunityRoleAtLeast(
  role: CommunityMemberRole,
  minimum: CommunityMemberRole,
): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

export function hasCommunityPermission(
  role: CommunityMemberRole,
  permission: CommunityPermission,
): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export async function getActiveCommunityMember(communityId: string, userId: string) {
  const member = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId,
      },
    },
  });

  if (!member || member.leftAt !== null || member.isBanned) {
    throw new AppError(403, "Bu topluluk için aktif üye olmalısınız");
  }

  return member;
}

export async function getCommunityMemberOrNull(communityId: string, userId: string) {
  return prisma.communityMember.findUnique({
    where: {
      communityId_userId: {
        communityId,
        userId,
      },
    },
  });
}

export function assertCommunityPermission(
  member: CommunityMember,
  permission: CommunityPermission,
) {
  if (!hasCommunityPermission(member.role, permission)) {
    throw new AppError(403, "Bu işlem için yetkiniz yok");
  }
}

export async function canViewCommunity(
  community: Community,
  userId?: string,
): Promise<boolean> {
  if (community.visibility === CommunityVisibility.PUBLIC) {
    return true;
  }

  if (!userId) {
    return false;
  }

  const member = await getCommunityMemberOrNull(community.id, userId);

  if (!member || member.leftAt !== null || member.isBanned) {
    return community.visibility === CommunityVisibility.INVITE_ONLY;
  }

  return true;
}

export function defaultPermissionsForChannelType(type: ChannelType): Omit<
  ChannelPermission,
  "id" | "channelId"
> {
  switch (type) {
    case ChannelType.ANNOUNCEMENT:
      return {
        minRoleView: CommunityMemberRole.GUEST,
        minRoleSend: CommunityMemberRole.MODERATOR,
        minRoleWatchStart: CommunityMemberRole.MODERATOR,
        minRoleWatchControl: CommunityMemberRole.MODERATOR,
        minRoleVoice: CommunityMemberRole.MODERATOR,
        minRoleVideo: CommunityMemberRole.MODERATOR,
      };
    case ChannelType.PRIVATE:
      return {
        minRoleView: CommunityMemberRole.MEMBER,
        minRoleSend: CommunityMemberRole.MEMBER,
        minRoleWatchStart: CommunityMemberRole.MEMBER,
        minRoleWatchControl: CommunityMemberRole.MODERATOR,
        minRoleVoice: CommunityMemberRole.MEMBER,
        minRoleVideo: CommunityMemberRole.MEMBER,
      };
    case ChannelType.WATCH:
      return {
        minRoleView: CommunityMemberRole.GUEST,
        minRoleSend: CommunityMemberRole.MEMBER,
        minRoleWatchStart: CommunityMemberRole.MEMBER,
        minRoleWatchControl: CommunityMemberRole.MODERATOR,
        minRoleVoice: CommunityMemberRole.MEMBER,
        minRoleVideo: CommunityMemberRole.MEMBER,
      };
    case ChannelType.VOICE:
      return {
        minRoleView: CommunityMemberRole.GUEST,
        minRoleSend: CommunityMemberRole.MEMBER,
        minRoleWatchStart: CommunityMemberRole.MODERATOR,
        minRoleWatchControl: CommunityMemberRole.MODERATOR,
        minRoleVoice: CommunityMemberRole.MEMBER,
        minRoleVideo: CommunityMemberRole.MEMBER,
      };
    case ChannelType.VIDEO:
      return {
        minRoleView: CommunityMemberRole.GUEST,
        minRoleSend: CommunityMemberRole.MEMBER,
        minRoleWatchStart: CommunityMemberRole.MODERATOR,
        minRoleWatchControl: CommunityMemberRole.MODERATOR,
        minRoleVoice: CommunityMemberRole.MEMBER,
        minRoleVideo: CommunityMemberRole.MEMBER,
      };
    default:
      return {
        minRoleView: CommunityMemberRole.GUEST,
        minRoleSend: CommunityMemberRole.MEMBER,
        minRoleWatchStart: CommunityMemberRole.MEMBER,
        minRoleWatchControl: CommunityMemberRole.MODERATOR,
        minRoleVoice: CommunityMemberRole.MEMBER,
        minRoleVideo: CommunityMemberRole.MEMBER,
      };
  }
}

export async function canViewChannel(
  channel: CommunityChannel & { permissions: ChannelPermission | null },
  member: CommunityMember | null,
): Promise<boolean> {
  if (channel.visibility === ChannelVisibility.PRIVATE) {
    if (!member || member.leftAt !== null || member.isBanned) {
      return false;
    }
  }

  const minRole = channel.permissions?.minRoleView ?? CommunityMemberRole.GUEST;

  if (!member || member.leftAt !== null || member.isBanned) {
    return minRole === CommunityMemberRole.GUEST && channel.visibility === ChannelVisibility.PUBLIC;
  }

  return hasCommunityRoleAtLeast(member.role, minRole);
}

export async function assertCanSendChannelMessage(
  channel: CommunityChannel & { permissions: ChannelPermission | null },
  member: CommunityMember,
) {
  if (channel.type === ChannelType.ANNOUNCEMENT) {
    assertCommunityPermission(member, "announcement.send");
    return;
  }

  const minRole = channel.permissions?.minRoleSend ?? CommunityMemberRole.MEMBER;

  if (!hasCommunityRoleAtLeast(member.role, minRole)) {
    throw new AppError(403, "Bu kanala mesaj gönderme yetkiniz yok");
  }
}

export async function getChannelByBackingRoomId(roomId: string) {
  return prisma.communityChannel.findFirst({
    where: { backingRoomId: roomId },
    include: {
      permissions: true,
      community: true,
    },
  });
}

export async function assertCanSendBackingRoomMessage(userId: string, roomId: string) {
  const channel = await getChannelByBackingRoomId(roomId);

  if (!channel) {
    return;
  }

  const member = await getActiveCommunityMember(channel.communityId, userId);
  await assertCanSendChannelMessage(channel, member);
}

export function mapCommunityRoleToRoomRole(
  communityRole: CommunityMemberRole,
  communityOwnerId: string,
  userId: string,
): RoomMemberRole {
  if (userId === communityOwnerId) {
    return RoomMemberRole.OWNER;
  }

  if (
    communityRole === CommunityMemberRole.OWNER ||
    communityRole === CommunityMemberRole.ADMIN ||
    communityRole === CommunityMemberRole.MODERATOR
  ) {
    return RoomMemberRole.MODERATOR;
  }

  return RoomMemberRole.MEMBER;
}

export function canManageCommunityMember(
  actor: CommunityMember,
  target: CommunityMember,
): boolean {
  if (actor.userId === target.userId) {
    return false;
  }

  if (target.role === CommunityMemberRole.OWNER) {
    return false;
  }

  return ROLE_RANK[actor.role] > ROLE_RANK[target.role];
}
