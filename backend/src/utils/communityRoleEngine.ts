import { ChannelType, CommunityMemberRole } from "@prisma/client";
import {
  ADMINISTRATOR_PERMISSION,
  ALL_COMMUNITY_PERMISSIONS,
  DEFAULT_ROLE_DEFINITIONS,
  mergeRolePermissions,
  type CommunityPermissionKey,
  type RolePermissionsMap,
} from "../constants/communityPermissionKeys";
import { prisma } from "../lib/prisma";

function parsePermissions(value: unknown): RolePermissionsMap {
  if (!value || typeof value !== "object") {
    return {};
  }
  return value as RolePermissionsMap;
}

function fullPermissions(): RolePermissionsMap {
  return Object.fromEntries(
    ALL_COMMUNITY_PERMISSIONS.map((key) => [key, true]),
  ) as RolePermissionsMap;
}

export async function ensureDefaultRoles(communityId: string): Promise<void> {
  const count = await prisma.communityRole.count({ where: { communityId } });

  if (count > 0) {
    return;
  }

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { ownerId: true },
  });

  if (!community) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const createdRoles = [];

    for (const definition of DEFAULT_ROLE_DEFINITIONS) {
      const role = await tx.communityRole.create({
        data: {
          communityId,
          name: definition.name,
          color: definition.color,
          position: definition.position,
          hoist: definition.hoist,
          mentionable: definition.mentionable,
          isDefault: definition.isDefault,
          isOwnerRole: definition.isOwnerRole,
          systemKey: definition.systemKey,
          permissions: definition.permissions,
        },
      });
      createdRoles.push(role);
    }

    const members = await tx.communityMember.findMany({
      where: { communityId, leftAt: null, isBanned: false },
    });

    const roleBySystemKey = new Map(
      createdRoles.map((role) => [role.systemKey ?? "", role]),
    );

    const enumToSystemKey: Record<CommunityMemberRole, string> = {
      OWNER: "OWNER",
      ADMIN: "ADMIN",
      MODERATOR: "MODERATOR",
      MEMBER: "MEMBER",
      GUEST: "GUEST",
    };

    for (const member of members) {
      const systemKey = enumToSystemKey[member.role];
      const role = roleBySystemKey.get(systemKey) ?? roleBySystemKey.get("MEMBER");

      if (!role) {
        continue;
      }

      await tx.communityMemberRoleAssignment.create({
        data: {
          memberId: member.id,
          roleId: role.id,
        },
      });
    }

    const ownerMember = members.find((member) => member.userId === community.ownerId);
    const ownerRole = roleBySystemKey.get("OWNER");

    if (ownerMember && ownerRole) {
      const existingOwnerAssignment = await tx.communityMemberRoleAssignment.findUnique({
        where: {
          memberId_roleId: {
            memberId: ownerMember.id,
            roleId: ownerRole.id,
          },
        },
      });

      if (!existingOwnerAssignment) {
        await tx.communityMemberRoleAssignment.create({
          data: {
            memberId: ownerMember.id,
            roleId: ownerRole.id,
          },
        });
      }
    }
  });
}

export async function getMemberRoleAssignments(memberId: string) {
  return prisma.communityMemberRoleAssignment.findMany({
    where: { memberId },
    include: { role: true },
    orderBy: { role: { position: "desc" } },
  });
}

export async function getMemberHighestRolePosition(memberId: string): Promise<number> {
  const assignments = await getMemberRoleAssignments(memberId);
  if (assignments.length === 0) {
    return 0;
  }
  return Math.max(...assignments.map((assignment) => assignment.role.position));
}

function enumFallbackPermissions(role: CommunityMemberRole): RolePermissionsMap {
  const definition = DEFAULT_ROLE_DEFINITIONS.find((item) => item.systemKey === role);
  return definition?.permissions ?? {};
}

function applyChannelOverrides(
  base: RolePermissionsMap,
  overrides: Array<{ allow: unknown; deny: unknown }>,
): RolePermissionsMap {
  let effective = { ...base };

  for (const override of overrides) {
    const allow = parsePermissions(override.allow);
    const deny = parsePermissions(override.deny);

    for (const key of ALL_COMMUNITY_PERMISSIONS) {
      if (deny[key]) {
        effective[key] = false;
      }
    }

    for (const key of ALL_COMMUNITY_PERMISSIONS) {
      if (allow[key]) {
        effective[key] = true;
      }
    }
  }

  if (effective[ADMINISTRATOR_PERMISSION]) {
    return fullPermissions();
  }

  return effective;
}

export async function getEffectivePermissions(
  userId: string,
  communityId: string,
  channelId?: string,
): Promise<RolePermissionsMap> {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { ownerId: true },
  });

  if (!community) {
    return {};
  }

  if (community.ownerId === userId) {
    return fullPermissions();
  }

  const member = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId, userId },
    },
    include: {
      roleAssignments: {
        include: { role: true },
      },
    },
  });

  if (!member || member.leftAt !== null || member.isBanned) {
    return {};
  }

  await ensureDefaultRoles(communityId);

  const refreshedMember = await prisma.communityMember.findUnique({
    where: { id: member.id },
    include: {
      roleAssignments: {
        include: { role: true },
      },
    },
  });

  if (!refreshedMember) {
    return {};
  }

  let permissionMaps = refreshedMember.roleAssignments.map((assignment) =>
    parsePermissions(assignment.role.permissions),
  );

  if (permissionMaps.length === 0) {
    permissionMaps = [enumFallbackPermissions(refreshedMember.role)];
  }

  let merged = mergeRolePermissions(permissionMaps);

  if (!channelId) {
    return merged;
  }

  const channel = await prisma.communityChannel.findUnique({
    where: { id: channelId },
    include: { permissionOverrides: true },
  });

  if (!channel) {
    return merged;
  }

  const roleIds = refreshedMember.roleAssignments.map((assignment) => assignment.roleId);
  const relevantOverrides = channel.permissionOverrides.filter((override) => {
    if (override.targetType === "MEMBER") {
      return override.targetId === refreshedMember.id;
    }
    return roleIds.includes(override.targetId);
  });

  relevantOverrides.sort((left, right) => {
    if (left.targetType === "MEMBER" && right.targetType !== "MEMBER") {
      return 1;
    }
    if (right.targetType === "MEMBER" && left.targetType !== "MEMBER") {
      return -1;
    }
    return 0;
  });

  return applyChannelOverrides(merged, relevantOverrides);
}

export async function hasServerPermission(
  userId: string,
  communityId: string,
  permission: CommunityPermissionKey,
): Promise<boolean> {
  const permissions = await getEffectivePermissions(userId, communityId);
  return permissions[permission] === true;
}

export async function hasChannelPermission(
  userId: string,
  channelId: string,
  permission: CommunityPermissionKey,
): Promise<boolean> {
  const channel = await prisma.communityChannel.findUnique({
    where: { id: channelId },
    select: { communityId: true },
  });

  if (!channel) {
    return false;
  }

  const permissions = await getEffectivePermissions(userId, channel.communityId, channelId);
  return permissions[permission] === true;
}

export function permissionsForChannelType(type: ChannelType): CommunityPermissionKey[] {
  const base: CommunityPermissionKey[] = ["channel.view", "channel.view_private"];

  switch (type) {
    case ChannelType.TEXT:
    case ChannelType.ANNOUNCEMENT:
      return [
        ...base,
        "text.send",
        "text.read",
        "text.delete",
        "text.edit",
        "text.attach_files",
        "text.embed_links",
        "text.use_reactions",
        "text.mention_everyone",
        "text.pin_messages",
        "text.read_history",
      ];
    case ChannelType.VOICE:
      return [
        ...base,
        "voice.join",
        "voice.speak",
        "voice.listen_muted",
        "voice.self_mute",
        "voice.mute_members",
        "voice.deafen_members",
        "voice.disconnect_members",
        "voice.manage",
      ];
    case ChannelType.VIDEO:
      return [
        ...base,
        "video.join",
        "video.camera",
        "video.screen_share",
        "video.view_screen_share",
        "video.manage",
        "voice.join",
        "voice.speak",
      ];
    case ChannelType.WATCH:
      return [
        ...base,
        "watch.view",
        "watch.start",
        "watch.queue_add",
        "watch.queue_edit",
        "watch.control",
        "watch.become_host",
        "watch.assisted_external_sync",
        "watch.send_sync_command",
        "watch.start_countdown",
        "text.send",
        "text.read",
        "text.read_history",
      ];
    case ChannelType.PRIVATE:
      return [
        ...base,
        "text.send",
        "text.read",
        "text.read_history",
        "voice.join",
        "video.join",
        "watch.view",
      ];
    default:
      return base;
  }
}

export async function assignDefaultMemberRole(
  communityId: string,
  memberId: string,
  enumRole: CommunityMemberRole = CommunityMemberRole.MEMBER,
): Promise<void> {
  await ensureDefaultRoles(communityId);

  const systemKey =
    enumRole === CommunityMemberRole.GUEST
      ? "GUEST"
      : enumRole === CommunityMemberRole.MODERATOR
        ? "MODERATOR"
        : enumRole === CommunityMemberRole.ADMIN
          ? "ADMIN"
          : enumRole === CommunityMemberRole.OWNER
            ? "OWNER"
            : "MEMBER";

  const role = await prisma.communityRole.findFirst({
    where: { communityId, systemKey },
  });

  if (!role) {
    return;
  }

  await prisma.communityMemberRoleAssignment.upsert({
    where: {
      memberId_roleId: {
        memberId,
        roleId: role.id,
      },
    },
    create: {
      memberId,
      roleId: role.id,
    },
    update: {},
  });
}
