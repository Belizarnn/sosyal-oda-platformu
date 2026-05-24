import { RoomMemberRole, type RoomMember } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "./asyncHandler";

export async function getRoomMember(roomId: string, userId: string) {
  return prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });
}

export async function getActiveRoomMember(roomId: string, userId: string) {
  const member = await getRoomMember(roomId, userId);

  if (!member || member.leftAt !== null || member.isBanned) {
    throw new AppError(403, "Bu oda için aktif üye olmalısınız");
  }

  return member;
}

export function isRoomOwner(member: RoomMember | null | undefined): boolean {
  return (
    Boolean(member) &&
    member!.leftAt === null &&
    member!.role === RoomMemberRole.OWNER
  );
}

export function isRoomModeratorOrOwner(
  member: RoomMember | null | undefined,
): boolean {
  if (!member || member.leftAt !== null) {
    return false;
  }

  return (
    member.role === RoomMemberRole.OWNER ||
    member.role === RoomMemberRole.MODERATOR
  );
}

export function canModerateMember(
  actor: RoomMember,
  target: RoomMember,
): boolean {
  if (actor.userId === target.userId) {
    return false;
  }

  if (target.role === RoomMemberRole.OWNER) {
    return false;
  }

  if (actor.role === RoomMemberRole.MEMBER) {
    return false;
  }

  if (
    actor.role === RoomMemberRole.MODERATOR &&
    target.role !== RoomMemberRole.MEMBER
  ) {
    return false;
  }

  return true;
}

export function canBanMember(actor: RoomMember, target: RoomMember): boolean {
  return actor.role === RoomMemberRole.OWNER && canModerateMember(actor, target);
}

export async function assertCanSendMessage(userId: string, roomId: string) {
  const membership = await getActiveRoomMember(roomId, userId);

  if (!membership.isMuted) {
    return membership;
  }

  if (membership.mutedUntil && membership.mutedUntil <= new Date()) {
    await prisma.roomMember.update({
      where: { id: membership.id },
      data: {
        isMuted: false,
        mutedUntil: null,
      },
    });
    return membership;
  }

  throw new AppError(403, "Bu odada susturuldun.");
}

export async function canDeleteMessage(
  actorUserId: string,
  roomId: string,
  messageSenderId: string,
): Promise<boolean> {
  if (actorUserId === messageSenderId) {
    return true;
  }

  const actor = await getActiveRoomMember(roomId, actorUserId);

  if (actor.role === RoomMemberRole.MEMBER) {
    return false;
  }

  const senderMember = await getRoomMember(roomId, messageSenderId);

  if (actor.role === RoomMemberRole.OWNER) {
    return (
      senderMember !== null &&
      senderMember.role !== RoomMemberRole.OWNER &&
      senderMember.userId !== actorUserId
    );
  }

  if (actor.role === RoomMemberRole.MODERATOR) {
    return senderMember?.role === RoomMemberRole.MEMBER;
  }

  return false;
}

// İleride slowmode burada kontrol edilebilir.
