import bcrypt from "bcrypt";
import { RoomType, type Room, type RoomMember } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { AppError } from "./asyncHandler";

export async function isRoomMember(roomId: string, userId: string): Promise<boolean> {
  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });

  return Boolean(membership && membership.leftAt === null && !membership.isBanned);
}

export async function canViewRoom(
  userId: string | undefined,
  room: Room,
): Promise<boolean> {
  if (!room.isActive) {
    return false;
  }

  if (room.type === RoomType.PRIVATE) {
    if (!userId) {
      return false;
    }

    return isRoomMember(room.id, userId);
  }

  return true;
}

export async function canJoinRoom(
  userId: string,
  room: Room,
  input: { inviteCode?: string; password?: string },
  existingMember: RoomMember | null,
): Promise<void> {
  if (!room.isActive) {
    throw new AppError(404, "Oda bulunamadı veya aktif değil");
  }

  if (existingMember?.isBanned) {
    throw new AppError(403, "Bu odadan banlandığın için katılamazsın.");
  }

  if (existingMember && existingMember.leftAt === null) {
    return;
  }

  switch (room.type) {
    case RoomType.PRIVATE:
      throw new AppError(403, "Bu özel odaya katılamazsın.");
    case RoomType.INVITE_ONLY:
      if (!room.inviteEnabled) {
        throw new AppError(403, "Bu odanın daveti kapatılmış.");
      }

      if (!input.inviteCode || input.inviteCode.trim().toUpperCase() !== room.inviteCode) {
        throw new AppError(403, "Bu oda davet kodu gerektiriyor.");
      }
      break;
    case RoomType.PASSWORD_PROTECTED:
      if (!room.passwordHash) {
        throw new AppError(500, "Oda yapılandırması geçersiz");
      }

      if (!input.password) {
        throw new AppError(403, "Bu oda için şifre gerekli");
      }

      {
        const passwordValid = await bcrypt.compare(input.password, room.passwordHash);

        if (!passwordValid) {
          throw new AppError(403, "Oda şifresi hatalı");
        }
      }
      break;
    case RoomType.PUBLIC:
      break;
    default:
      throw new AppError(403, "Bu odaya katılamazsın.");
  }
}

export async function validateRoomAccessForMessages(
  roomId: string,
  userId: string,
): Promise<RoomMember> {
  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });

  if (!membership || membership.leftAt !== null || membership.isBanned) {
    throw new AppError(403, "Bu oda için aktif üye olmalısınız");
  }

  if (membership.isMuted) {
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

  return membership;
}
