import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";
import {
  sanitizePermissionsInput,
  type RolePermissionsMap,
} from "../../constants/communityPermissionKeys";
import {
  ensureDefaultRoles,
  getMemberHighestRolePosition,
  getMemberRoleAssignments,
  hasServerPermission,
} from "../../utils/communityRoleEngine";
import { getActiveCommunityMember } from "../../utils/communityPermissions";
import { trimAndLimit } from "../../utils/sanitizeInput";
import type {
  CreateRoleInput,
  ReorderRolesInput,
  UpdateChannelPermissionsInput,
  UpdateRoleInput,
} from "./communityRole.types";

function formatRole(role: {
  id: string;
  communityId: string;
  name: string;
  color: string;
  iconUrl: string | null;
  permissions: unknown;
  position: number;
  hoist: boolean;
  mentionable: boolean;
  isDefault: boolean;
  isOwnerRole: boolean;
  systemKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: role.id,
    communityId: role.communityId,
    name: role.name,
    color: role.color,
    iconUrl: role.iconUrl,
    permissions: (role.permissions ?? {}) as RolePermissionsMap,
    position: role.position,
    hoist: role.hoist,
    mentionable: role.mentionable,
    isDefault: role.isDefault,
    isOwnerRole: role.isOwnerRole,
    systemKey: role.systemKey,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
  };
}

async function assertCanManageRoles(communityId: string, userId: string) {
  const canManage = await hasServerPermission(userId, communityId, "server.manage_roles");
  if (!canManage) {
    throw new AppError(403, "Rolleri yönetme yetkiniz yok");
  }
}

async function assertCanEditRole(
  communityId: string,
  actorUserId: string,
  targetRoleId: string,
) {
  await assertCanManageRoles(communityId, actorUserId);

  const community = await prisma.community.findUnique({
    where: { id: communityId },
    select: { ownerId: true },
  });

  const actorMember = await getActiveCommunityMember(communityId, actorUserId);
  const actorPosition = await getMemberHighestRolePosition(actorMember.id);

  const targetRole = await prisma.communityRole.findFirst({
    where: { id: targetRoleId, communityId },
  });

  if (!targetRole) {
    throw new AppError(404, "Rol bulunamadı");
  }

  if (targetRole.isOwnerRole && community?.ownerId !== actorUserId) {
    throw new AppError(403, "Kurucu rolü yalnızca sunucu sahibi tarafından yönetilebilir");
  }

  if (!targetRole.isOwnerRole && actorPosition <= targetRole.position) {
    throw new AppError(403, "Kendi rolünüzden yüksek veya eşit rolleri düzenleyemezsiniz");
  }

  return { actorMember, targetRole, actorPosition };
}

export async function listCommunityRoles(communityId: string, userId: string) {
  await getActiveCommunityMember(communityId, userId);
  await ensureDefaultRoles(communityId);

  const roles = await prisma.communityRole.findMany({
    where: { communityId },
    orderBy: { position: "desc" },
  });

  const canManage = await hasServerPermission(userId, communityId, "server.manage_roles");

  return {
    roles: roles.map(formatRole),
    canManageRoles: canManage,
  };
}

export async function getCommunityRoleById(
  communityId: string,
  roleId: string,
  userId: string,
) {
  await getActiveCommunityMember(communityId, userId);
  await ensureDefaultRoles(communityId);

  const role = await prisma.communityRole.findFirst({
    where: { id: roleId, communityId },
  });

  if (!role) {
    throw new AppError(404, "Rol bulunamadı");
  }

  const members = await prisma.communityMemberRoleAssignment.findMany({
    where: { roleId },
    include: {
      member: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              handle: true,
              avatarUrl: true,
              presenceStatus: true,
              statusMessage: true,
            },
          },
        },
      },
    },
    orderBy: { assignedAt: "asc" },
  });

  return {
    role: formatRole(role),
    members: members.map((assignment) => ({
      assignmentId: assignment.id,
      memberId: assignment.memberId,
      userId: assignment.member.userId,
      assignedAt: assignment.assignedAt.toISOString(),
      user: assignment.member.user,
    })),
  };
}

export async function createCommunityRole(
  communityId: string,
  userId: string,
  input: CreateRoleInput,
) {
  await assertCanManageRoles(communityId, userId);

  const actorMember = await getActiveCommunityMember(communityId, userId);
  const actorPosition = await getMemberHighestRolePosition(actorMember.id);

  const maxPosition = await prisma.communityRole.aggregate({
    where: { communityId },
    _max: { position: true },
  });

  const requestedPosition = input.position ?? (maxPosition._max.position ?? 0) + 1;

  if (requestedPosition >= actorPosition) {
    throw new AppError(403, "Kendi rolünüzden yüksek veya eşit pozisyonda rol oluşturamazsınız");
  }

  const name = trimAndLimit(input.name, 80);

  const role = await prisma.communityRole.create({
    data: {
      communityId,
      name,
      color: input.color ?? "#99AAB5",
      iconUrl: input.iconUrl ?? null,
      permissions: sanitizePermissionsInput(input.permissions),
      position: requestedPosition,
      hoist: input.hoist ?? false,
      mentionable: input.mentionable ?? true,
      isDefault: false,
      isOwnerRole: false,
    },
  });

  return { role: formatRole(role) };
}

export async function updateCommunityRole(
  communityId: string,
  roleId: string,
  userId: string,
  input: UpdateRoleInput,
) {
  const { targetRole } = await assertCanEditRole(communityId, userId, roleId);

  if (targetRole.isOwnerRole && input.permissions) {
    const sanitized = sanitizePermissionsInput(input.permissions);
    const ownerRole = await prisma.communityRole.findUnique({ where: { id: roleId } });
    const current = (ownerRole?.permissions ?? {}) as RolePermissionsMap;

    for (const criticalKey of ["administrator", "server.delete", "server.manage_roles"] as const) {
      if (current[criticalKey] && !sanitized[criticalKey]) {
        throw new AppError(400, "Kurucu rolünün kritik izinleri kapatılamaz");
      }
    }
  }

  const updated = await prisma.communityRole.update({
    where: { id: roleId },
    data: {
      ...(input.name !== undefined ? { name: trimAndLimit(input.name, 80) } : {}),
      ...(input.color !== undefined ? { color: input.color } : {}),
      ...(input.iconUrl !== undefined ? { iconUrl: input.iconUrl } : {}),
      ...(input.permissions !== undefined
        ? { permissions: sanitizePermissionsInput(input.permissions) }
        : {}),
      ...(input.position !== undefined ? { position: input.position } : {}),
      ...(input.hoist !== undefined ? { hoist: input.hoist } : {}),
      ...(input.mentionable !== undefined ? { mentionable: input.mentionable } : {}),
    },
  });

  return { role: formatRole(updated) };
}

export async function deleteCommunityRole(
  communityId: string,
  roleId: string,
  userId: string,
) {
  const { targetRole } = await assertCanEditRole(communityId, userId, roleId);

  if (targetRole.isDefault || targetRole.isOwnerRole) {
    throw new AppError(400, "Varsayılan veya kurucu rolü silinemez");
  }

  await prisma.communityRole.delete({ where: { id: roleId } });

  return { message: "Rol silindi" };
}

export async function reorderCommunityRoles(
  communityId: string,
  userId: string,
  input: ReorderRolesInput,
) {
  await assertCanManageRoles(communityId, userId);

  const actorMember = await getActiveCommunityMember(communityId, userId);
  const actorPosition = await getMemberHighestRolePosition(actorMember.id);

  const roles = await prisma.communityRole.findMany({
    where: { communityId },
  });

  if (input.roleIds.length !== roles.length) {
    throw new AppError(400, "Tüm roller sıralama için gönderilmelidir");
  }

  const roleMap = new Map(roles.map((role) => [role.id, role]));

  for (const roleId of input.roleIds) {
    if (!roleMap.has(roleId)) {
      throw new AppError(400, "Geçersiz rol kimliği");
    }
  }

  const orderedRoles = input.roleIds.map((roleId) => roleMap.get(roleId)!);

  for (const role of orderedRoles) {
    if (role.isOwnerRole) {
      continue;
    }
    if (role.position >= actorPosition) {
      throw new AppError(403, "Kendi rolünüzden yüksek rolleri yeniden sıralayamazsınız");
    }
  }

  await prisma.$transaction(
    orderedRoles.map((role, index) =>
      prisma.communityRole.update({
        where: { id: role.id },
        data: { position: (orderedRoles.length - index) * 10 },
      }),
    ),
  );

  const refreshed = await prisma.communityRole.findMany({
    where: { communityId },
    orderBy: { position: "desc" },
  });

  return { roles: refreshed.map(formatRole) };
}

export async function assignRoleToMember(
  communityId: string,
  memberId: string,
  roleId: string,
  actorUserId: string,
) {
  await assertCanManageRoles(communityId, actorUserId);

  const actorMember = await getActiveCommunityMember(communityId, actorUserId);
  const actorPosition = await getMemberHighestRolePosition(actorMember.id);

  const targetMember = await prisma.communityMember.findFirst({
    where: { id: memberId, communityId },
  });

  if (!targetMember || targetMember.leftAt !== null || targetMember.isBanned) {
    throw new AppError(404, "Üye bulunamadı");
  }

  const role = await prisma.communityRole.findFirst({
    where: { id: roleId, communityId },
  });

  if (!role) {
    throw new AppError(404, "Rol bulunamadı");
  }

  if (role.isOwnerRole) {
    throw new AppError(403, "Kurucu rolü devredilemez");
  }

  if (role.position >= actorPosition) {
    throw new AppError(403, "Kendi rolünüzden yüksek veya eşit rol atayamazsınız");
  }

  const assignment = await prisma.communityMemberRoleAssignment.upsert({
    where: {
      memberId_roleId: { memberId, roleId },
    },
    create: {
      memberId,
      roleId,
      assignedById: actorUserId,
    },
    update: {
      assignedById: actorUserId,
    },
  });

  return {
    assignment: {
      id: assignment.id,
      memberId: assignment.memberId,
      roleId: assignment.roleId,
      assignedAt: assignment.assignedAt.toISOString(),
    },
  };
}

export async function removeRoleFromMember(
  communityId: string,
  memberId: string,
  roleId: string,
  actorUserId: string,
) {
  await assertCanManageRoles(communityId, actorUserId);

  const actorMember = await getActiveCommunityMember(communityId, actorUserId);
  const actorPosition = await getMemberHighestRolePosition(actorMember.id);

  const role = await prisma.communityRole.findFirst({
    where: { id: roleId, communityId },
  });

  if (!role) {
    throw new AppError(404, "Rol bulunamadı");
  }

  if (role.isOwnerRole) {
    throw new AppError(403, "Kurucu rolü kaldırılamaz");
  }

  if (role.position >= actorPosition) {
    throw new AppError(403, "Kendi rolünüzden yüksek veya eşit rol kaldıramazsınız");
  }

  await prisma.communityMemberRoleAssignment.deleteMany({
    where: { memberId, roleId },
  });

  return { message: "Rol kaldırıldı" };
}

export async function listMemberRoles(
  communityId: string,
  memberId: string,
  userId: string,
) {
  await getActiveCommunityMember(communityId, userId);
  await ensureDefaultRoles(communityId);

  const member = await prisma.communityMember.findFirst({
    where: { id: memberId, communityId },
  });

  if (!member) {
    throw new AppError(404, "Üye bulunamadı");
  }

  const assignments = await getMemberRoleAssignments(memberId);

  return {
    roles: assignments.map((assignment) => formatRole(assignment.role)),
  };
}

export async function getChannelPermissions(
  communityId: string,
  channelId: string,
  userId: string,
) {
  const canEdit = await hasServerPermission(userId, communityId, "channel.edit");
  if (!canEdit) {
    throw new AppError(403, "Kanal izinlerini görüntüleme yetkiniz yok");
  }

  const channel = await prisma.communityChannel.findFirst({
    where: { id: channelId, communityId },
    include: { permissionOverrides: true },
  });

  if (!channel) {
    throw new AppError(404, "Kanal bulunamadı");
  }

  return {
    overrides: channel.permissionOverrides.map((override) => ({
      id: override.id,
      channelId: override.channelId,
      targetType: override.targetType,
      targetId: override.targetId,
      allow: override.allow as RolePermissionsMap,
      deny: override.deny as RolePermissionsMap,
      createdAt: override.createdAt.toISOString(),
      updatedAt: override.updatedAt.toISOString(),
    })),
  };
}

export async function updateChannelPermissions(
  communityId: string,
  channelId: string,
  userId: string,
  input: UpdateChannelPermissionsInput,
) {
  const canEdit = await hasServerPermission(userId, communityId, "channel.edit");
  if (!canEdit) {
    throw new AppError(403, "Kanal izinlerini düzenleme yetkiniz yok");
  }

  const channel = await prisma.communityChannel.findFirst({
    where: { id: channelId, communityId },
  });

  if (!channel) {
    throw new AppError(404, "Kanal bulunamadı");
  }

  await prisma.$transaction(async (tx) => {
    await tx.channelPermissionOverride.deleteMany({ where: { channelId } });

    for (const override of input.overrides) {
      await tx.channelPermissionOverride.create({
        data: {
          channelId,
          targetType: override.targetType,
          targetId: override.targetId,
          allow: sanitizePermissionsInput(override.allow),
          deny: sanitizePermissionsInput(override.deny),
        },
      });
    }
  });

  return getChannelPermissions(communityId, channelId, userId);
}
