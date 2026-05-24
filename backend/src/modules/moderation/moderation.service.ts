import { NotificationType, ReportTargetType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";
import { trimAndLimit } from "../../utils/sanitizeInput";
import { createNotification } from "../notifications/notification.service";
import {
  canBanMember,
  canDeleteMessage,
  canModerateMember,
  getActiveRoomMember,
  getRoomMember,
  isRoomModeratorOrOwner,
  isRoomOwner,
} from "../../utils/permissions";
import { assertRoomExists } from "../rooms/room.service";
import type { CreateReportInput, MuteMemberInput } from "./moderation.schemas";
import {
  emitMessageDeleted,
  emitModerationEvent,
  formatModerationMember,
} from "./moderation.events";

async function getTargetMember(roomId: string, targetUserId: string) {
  const target = await getRoomMember(roomId, targetUserId);

  if (!target) {
    throw new AppError(404, "Hedef kullanıcı bu odada bulunamadı");
  }

  return target;
}

async function getActiveTargetMember(roomId: string, targetUserId: string) {
  const target = await getTargetMember(roomId, targetUserId);

  if (target.leftAt !== null) {
    throw new AppError(400, "Kullanıcı zaten odada değil");
  }

  return target;
}

export async function kickMember(
  roomId: string,
  actorUserId: string,
  targetUserId: string,
) {
  await assertRoomExists(roomId);
  const actor = await getActiveRoomMember(roomId, actorUserId);
  const target = await getActiveTargetMember(roomId, targetUserId);

  if (!isRoomModeratorOrOwner(actor)) {
    throw new AppError(403, "Bu işlem için yetkin yok");
  }

  if (!canModerateMember(actor, target)) {
    throw new AppError(403, "Bu kullanıcıyı odadan atamazsın");
  }

  await prisma.$transaction(async (tx) => {
    await tx.roomMember.update({
      where: { id: target.id },
      data: { leftAt: new Date() },
    });

    const room = await tx.room.findUnique({ where: { id: roomId } });

    if (room && room.currentUserCount > 0) {
      await tx.room.update({
        where: { id: roomId },
        data: { currentUserCount: { decrement: 1 } },
      });
    }
  });

  emitModerationEvent(roomId, "moderation:user-kicked", {
    userId: targetUserId,
    actorUserId,
  });

  await createNotification({
    userId: targetUserId,
    type: NotificationType.ROOM_MODERATION,
    title: "Bir odadan çıkarıldın",
    body: "Bir moderasyon işlemi sonucu odadan çıkarıldın.",
    link: `/rooms/${roomId}`,
    metadata: { roomId, action: "kick" },
  });

  return { message: "Kullanıcı odadan atıldı." };
}

export async function muteMember(
  roomId: string,
  actorUserId: string,
  targetUserId: string,
  input: MuteMemberInput,
) {
  await assertRoomExists(roomId);
  const actor = await getActiveRoomMember(roomId, actorUserId);
  const target = await getActiveTargetMember(roomId, targetUserId);

  if (!isRoomModeratorOrOwner(actor)) {
    throw new AppError(403, "Bu işlem için yetkin yok");
  }

  if (!canModerateMember(actor, target)) {
    throw new AppError(403, "Bu kullanıcıyı susturamazsın");
  }

  const mutedUntil = input.mutedUntil ? new Date(input.mutedUntil) : null;

  const updated = await prisma.roomMember.update({
    where: { id: target.id },
    data: {
      isMuted: true,
      mutedUntil,
    },
    include: { user: true },
  });

  emitModerationEvent(roomId, "moderation:user-muted", {
    userId: targetUserId,
    mutedUntil: updated.mutedUntil?.toISOString() ?? null,
  });

  await createNotification({
    userId: targetUserId,
    type: NotificationType.ROOM_MODERATION,
    title: "Bir odada susturuldun",
    body: "Bu odada geçici olarak susturuldun.",
    link: `/rooms/${roomId}`,
    metadata: { roomId, action: "mute" },
  });

  return { member: formatModerationMember(updated) };
}

export async function unmuteMember(
  roomId: string,
  actorUserId: string,
  targetUserId: string,
) {
  await assertRoomExists(roomId);
  const actor = await getActiveRoomMember(roomId, actorUserId);
  const target = await getTargetMember(roomId, targetUserId);

  if (!isRoomModeratorOrOwner(actor)) {
    throw new AppError(403, "Bu işlem için yetkin yok");
  }

  if (!canModerateMember(actor, target)) {
    throw new AppError(403, "Bu kullanıcının susturmasını kaldıramazsın");
  }

  const updated = await prisma.roomMember.update({
    where: { id: target.id },
    data: {
      isMuted: false,
      mutedUntil: null,
    },
    include: { user: true },
  });

  emitModerationEvent(roomId, "moderation:user-unmuted", {
    userId: targetUserId,
  });

  return { member: formatModerationMember(updated) };
}

export async function banMember(
  roomId: string,
  actorUserId: string,
  targetUserId: string,
) {
  await assertRoomExists(roomId);
  const actor = await getActiveRoomMember(roomId, actorUserId);
  const target = await getTargetMember(roomId, targetUserId);

  if (!isRoomOwner(actor)) {
    throw new AppError(403, "Ban işlemi sadece oda sahibi tarafından yapılabilir");
  }

  if (!canBanMember(actor, target)) {
    throw new AppError(403, "Bu kullanıcıyı banlayamazsın");
  }

  const wasActive = target.leftAt === null;

  await prisma.$transaction(async (tx) => {
    await tx.roomMember.update({
      where: { id: target.id },
      data: {
        isBanned: true,
        bannedAt: new Date(),
        leftAt: new Date(),
        isMuted: false,
        mutedUntil: null,
      },
    });

    if (wasActive) {
      const room = await tx.room.findUnique({ where: { id: roomId } });

      if (room && room.currentUserCount > 0) {
        await tx.room.update({
          where: { id: roomId },
          data: { currentUserCount: { decrement: 1 } },
        });
      }
    }
  });

  emitModerationEvent(roomId, "moderation:user-banned", {
    userId: targetUserId,
  });

  await createNotification({
    userId: targetUserId,
    type: NotificationType.ROOM_MODERATION,
    title: "Bir odadan banlandın",
    body: "Bu odaya tekrar katılamazsın.",
    link: "/dashboard",
    metadata: { roomId, action: "ban" },
  });

  return { message: "Kullanıcı banlandı." };
}

export async function unbanMember(
  roomId: string,
  actorUserId: string,
  targetUserId: string,
) {
  await assertRoomExists(roomId);
  const actor = await getActiveRoomMember(roomId, actorUserId);
  const target = await getTargetMember(roomId, targetUserId);

  if (!isRoomOwner(actor)) {
    throw new AppError(403, "Ban kaldırma sadece oda sahibi tarafından yapılabilir");
  }

  if (!target.isBanned) {
    throw new AppError(400, "Kullanıcı banlı değil");
  }

  const updated = await prisma.roomMember.update({
    where: { id: target.id },
    data: {
      isBanned: false,
      bannedAt: null,
    },
    include: { user: true },
  });

  emitModerationEvent(roomId, "moderation:user-unbanned", {
    userId: targetUserId,
  });

  return { member: formatModerationMember(updated) };
}

export async function deleteRoomMessage(
  roomId: string,
  messageId: string,
  actorUserId: string,
) {
  await assertRoomExists(roomId);

  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      roomId,
      deletedAt: null,
    },
  });

  if (!message) {
    throw new AppError(404, "Mesaj bulunamadı");
  }

  const allowed = await canDeleteMessage(
    actorUserId,
    roomId,
    message.senderId,
  );

  if (!allowed) {
    throw new AppError(403, "Bu mesajı silme yetkin yok");
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });

  emitMessageDeleted(roomId, messageId);

  return { message: "Mesaj silindi." };
}

function formatReport(report: Awaited<ReturnType<typeof prisma.report.create>>) {
  return {
    id: report.id,
    reporterId: report.reporterId,
    targetType: report.targetType,
    targetUserId: report.targetUserId,
    targetMessageId: report.targetMessageId,
    targetRoomId: report.targetRoomId,
    reason: report.reason,
    description: report.description,
    status: report.status,
    createdAt: report.createdAt.toISOString(),
    updatedAt: report.updatedAt.toISOString(),
  };
}

export async function createReport(
  reporterId: string,
  input: CreateReportInput,
) {
  if (input.targetType === ReportTargetType.USER && input.targetUserId) {
    const user = await prisma.user.findUnique({
      where: { id: input.targetUserId },
    });

    if (!user) {
      throw new AppError(404, "Kullanıcı bulunamadı");
    }
  }

  if (input.targetType === ReportTargetType.MESSAGE && input.targetMessageId) {
    const message = await prisma.message.findUnique({
      where: { id: input.targetMessageId },
    });

    if (!message) {
      throw new AppError(404, "Mesaj bulunamadı");
    }
  }

  if (input.targetType === ReportTargetType.ROOM && input.targetRoomId) {
    await assertRoomExists(input.targetRoomId);
  }

  const report = await prisma.report.create({
    data: {
      reporterId,
      targetType: input.targetType,
      targetUserId: input.targetUserId ?? null,
      targetMessageId: input.targetMessageId ?? null,
      targetRoomId: input.targetRoomId ?? null,
      reason: trimAndLimit(input.reason, 120),
      description: input.description
        ? trimAndLimit(input.description, 500)
        : null,
    },
  });

  return {
    message: "Rapor alındı.",
    report: formatReport(report),
  };
}
