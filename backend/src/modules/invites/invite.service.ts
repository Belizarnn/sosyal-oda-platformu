import { RoomMemberRole, RoomType } from "@prisma/client";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";
import { createUniqueInviteCode } from "../../utils/generateInviteCode";
import { isRoomModeratorOrOwner } from "../../utils/permissions";
import { sanitizeOwner, sanitizeRoom } from "../../utils/sanitizeRoom";
import type { UpdateInviteSettingsInput } from "./invite.schemas";

function buildInviteUrl(inviteCode: string): string {
  const baseUrl = env.frontendUrl.replace(/\/$/, "");
  return `${baseUrl}/invite/${inviteCode}`;
}

function normalizeInviteCode(inviteCode: string): string {
  return inviteCode.trim().toUpperCase();
}

export async function getInvitePreview(inviteCode: string) {
  const room = await prisma.room.findUnique({
    where: { inviteCode: normalizeInviteCode(inviteCode) },
    include: { owner: true },
  });

  if (!room || !room.isActive || !room.inviteEnabled) {
    throw new AppError(404, "Bu davet bağlantısı geçersiz veya kapatılmış.");
  }

  const safeRoom = sanitizeRoom(room);

  return {
    room: {
      id: safeRoom.id,
      name: safeRoom.name,
      description: safeRoom.description,
      category: safeRoom.category,
      type: safeRoom.type,
      currentUserCount: safeRoom.currentUserCount,
      maxUserCount: safeRoom.maxUserCount,
    },
    owner: sanitizeOwner(room.owner),
    requiresPassword: room.type === RoomType.PASSWORD_PROTECTED,
    canPreview: true,
    inviteEnabled: room.inviteEnabled,
  };
}

export async function regenerateRoomInvite(roomId: string, userId: string) {
  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });

  if (!isRoomModeratorOrOwner(membership)) {
    throw new AppError(403, "Davet bağlantısını yalnızca oda sahibi veya moderatör yenileyebilir.");
  }

  const inviteCode = await createUniqueInviteCode();
  const now = new Date();

  const room = await prisma.room.update({
    where: { id: roomId },
    data: {
      inviteCode,
      inviteUpdatedAt: now,
      inviteCreatedAt: now,
    },
  });

  return {
    inviteCode: room.inviteCode,
    inviteUrl: buildInviteUrl(room.inviteCode),
    inviteEnabled: room.inviteEnabled,
    inviteUpdatedAt: room.inviteUpdatedAt?.toISOString() ?? now.toISOString(),
  };
}

export async function updateInviteSettings(
  roomId: string,
  userId: string,
  input: UpdateInviteSettingsInput,
) {
  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });

  if (!membership || membership.leftAt !== null || membership.role !== RoomMemberRole.OWNER) {
    throw new AppError(403, "Davet ayarlarını yalnızca oda sahibi değiştirebilir.");
  }

  const room = await prisma.room.update({
    where: { id: roomId },
    data: {
      inviteEnabled: input.inviteEnabled,
      inviteUpdatedAt: new Date(),
    },
  });

  return {
    inviteCode: room.inviteCode,
    inviteUrl: buildInviteUrl(room.inviteCode),
    inviteEnabled: room.inviteEnabled,
    inviteUpdatedAt: room.inviteUpdatedAt?.toISOString() ?? null,
  };
}
