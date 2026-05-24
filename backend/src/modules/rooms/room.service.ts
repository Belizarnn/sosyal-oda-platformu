import bcrypt from "bcrypt";
import { RoomMemberRole, RoomType } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { trackServerEvent } from "../../lib/analytics";
import { AppError } from "../../utils/asyncHandler";
import { createUniqueInviteCode } from "../../utils/generateInviteCode";
import { isRoomModeratorOrOwner } from "../../utils/permissions";
import { canJoinRoom, canViewRoom } from "../../utils/roomAccess";
import {
  sanitizeMemberUser,
  sanitizeOwner,
  sanitizeRoom,
} from "../../utils/sanitizeRoom";
import { createUniqueSlug } from "../../utils/slugify";
import { trimAndLimit } from "../../utils/sanitizeInput";
import {
  clampLimit,
  DEFAULT_PAGE_LIMIT,
  buildOlderThanCursorFilter,
  MAX_PAGE_LIMIT,
} from "../../utils/pagination";
import { publicUserSelect, roomOwnerSelect } from "../../utils/prismaSelects";
import * as watchService from "../watch/watch.service";
import type {
  CreateRoomInput,
  JoinRoomInput,
  ListRoomsQuery,
} from "./room.schemas";

const BCRYPT_ROUNDS = 12;

function formatListRoom(
  room: Awaited<ReturnType<typeof prisma.room.findMany>>[number] & {
    owner: Parameters<typeof sanitizeOwner>[0];
  },
) {
  const safeRoom = sanitizeRoom(room);

  return {
    id: safeRoom.id,
    name: safeRoom.name,
    slug: safeRoom.slug,
    description: safeRoom.description,
    category: safeRoom.category,
    type: safeRoom.type,
    owner: sanitizeOwner(room.owner),
    currentUserCount: safeRoom.currentUserCount,
    maxUserCount: safeRoom.maxUserCount,
    inviteCode: safeRoom.inviteCode,
    isActive: safeRoom.isActive,
    createdAt: safeRoom.createdAt,
  };
}

export async function listRooms(query: ListRoomsQuery, userId?: string) {
  const limit = clampLimit(query.limit, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
  const cursorRoom = query.cursor
    ? await prisma.room.findFirst({
        where: { id: query.cursor },
        select: { id: true, createdAt: true },
      })
    : null;

  const rooms = await prisma.room.findMany({
    where: {
      isActive: true,
      isCommunityBacking: false,
      type: query.type ?? RoomType.PUBLIC,
      ...(query.category ? { category: query.category } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: "insensitive" } },
              { description: { contains: query.search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...buildOlderThanCursorFilter(cursorRoom),
    },
    include: {
      owner: {
        select: roomOwnerSelect,
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = rooms.length > limit;
  const page = hasMore ? rooms.slice(0, limit) : rooms;

  let memberRoomIds = new Set<string>();

  if (userId && page.length > 0) {
    const memberships = await prisma.roomMember.findMany({
      where: {
        userId,
        leftAt: null,
        isBanned: false,
        roomId: { in: page.map((room) => room.id) },
      },
      select: { roomId: true },
    });

    memberRoomIds = new Set(memberships.map((membership) => membership.roomId));
  }

  return {
    rooms: page.map((room) => ({
      ...formatListRoom(room),
      isMember: memberRoomIds.has(room.id),
    })),
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
  };
}

export async function createRoom(ownerId: string, input: CreateRoomInput) {
  const roomName = trimAndLimit(input.name, 60);

  if (roomName.length < 3) {
    throw new AppError(400, "Oda adı en az 3 karakter olmalı");
  }

  const slug = await createUniqueSlug(roomName, async (candidate) => {
    const existing = await prisma.room.findUnique({ where: { slug: candidate } });
    return Boolean(existing);
  });

  const inviteCode = await createUniqueInviteCode();
  const inviteTimestamp = new Date();

  let passwordHash: string | null = null;

  if (input.type === RoomType.PASSWORD_PROTECTED && input.password) {
    passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  const room = await prisma.$transaction(async (tx) => {
    const createdRoom = await tx.room.create({
      data: {
        name: roomName,
        slug,
        description: input.description
          ? trimAndLimit(input.description, 240)
          : null,
        category: input.category,
        type: input.type,
        ownerId,
        maxUserCount: input.maxUserCount,
        inviteCode,
        inviteEnabled: true,
        inviteCreatedAt: inviteTimestamp,
        inviteUpdatedAt: inviteTimestamp,
        passwordHash,
        currentUserCount: 1,
      },
      include: {
        owner: true,
      },
    });

    await tx.roomMember.create({
      data: {
        roomId: createdRoom.id,
        userId: ownerId,
        role: RoomMemberRole.OWNER,
      },
    });

    return createdRoom;
  });

  void trackServerEvent({
    eventName: "room_created",
    userId: ownerId,
    properties: {
      roomId: room.id,
      category: room.category,
      type: room.type,
    },
  });

  return formatListRoom(room);
}

export async function getRoomById(roomId: string, userId?: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      owner: {
        select: roomOwnerSelect,
      },
      members: {
        where: {
          leftAt: null,
          isBanned: false,
        },
        include: {
          user: {
            select: publicUserSelect,
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
    },
  });

  if (!room) {
    throw new AppError(404, "Oda bulunamadı");
  }

  const canView = await canViewRoom(userId, room);

  if (!canView) {
    throw new AppError(403, "Bu odayı görüntüleme yetkiniz yok");
  }

  const safeRoom = sanitizeRoom(room);
  const activeMembership = userId
    ? room.members.find((member) => member.userId === userId)
    : undefined;

  const canManageInvite = isRoomModeratorOrOwner(activeMembership ?? null);
  const { inviteCode: _inviteCode, ...roomWithoutInviteCode } = safeRoom;

  return {
    room: canManageInvite
      ? safeRoom
      : {
          ...roomWithoutInviteCode,
          inviteCode: "",
        },
    owner: sanitizeOwner(room.owner),
    members: room.members.map((member) => ({
      id: member.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt.toISOString(),
      isMuted: member.isMuted,
      isBanned: member.isBanned,
      mutedUntil: member.mutedUntil?.toISOString() ?? null,
      user: sanitizeMemberUser(member.user),
    })),
    currentUserCount: safeRoom.currentUserCount,
    isMember: Boolean(activeMembership),
    currentUserRole: activeMembership?.role ?? null,
    canManageInvite,
  };
}

export async function joinRoom(
  roomId: string,
  userId: string,
  input: JoinRoomInput,
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room || !room.isActive) {
    throw new AppError(404, "Oda bulunamadı veya aktif değil");
  }

  const existingMember = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });

  if (existingMember?.isBanned) {
    throw new AppError(403, "Bu odadan banlandığın için katılamazsın.");
  }

  if (existingMember && existingMember.leftAt === null) {
    return getRoomById(roomId, userId);
  }

  if (room.currentUserCount >= room.maxUserCount) {
    throw new AppError(409, "Oda dolu");
  }

  await canJoinRoom(userId, room, input, existingMember);

  await prisma.$transaction(async (tx) => {
    if (existingMember) {
      await tx.roomMember.update({
        where: { id: existingMember.id },
        data: {
          leftAt: null,
          joinedAt: new Date(),
          role:
            existingMember.role === RoomMemberRole.OWNER
              ? RoomMemberRole.OWNER
              : RoomMemberRole.MEMBER,
        },
      });
    } else {
      await tx.roomMember.create({
        data: {
          roomId,
          userId,
          role: RoomMemberRole.MEMBER,
        },
      });
    }

    await tx.room.update({
      where: { id: roomId },
      data: {
        currentUserCount: {
          increment: 1,
        },
      },
    });
  });

  void trackServerEvent({
    eventName: "room_joined",
    userId,
    properties: {
      roomId,
      category: room.category,
      type: room.type,
    },
  });

  return getRoomById(roomId, userId);
}

export async function leaveRoom(roomId: string, userId: string) {
  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });

  if (!membership || membership.leftAt !== null) {
    throw new AppError(404, "Bu odanın aktif üyesi değilsiniz");
  }

  if (membership.role === RoomMemberRole.OWNER) {
    throw new AppError(400, "Oda sahibi odadan ayrılamaz. Önce odayı kapatmalıdır.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.roomMember.update({
      where: { id: membership.id },
      data: {
        leftAt: new Date(),
      },
    });

    const room = await tx.room.findUnique({ where: { id: roomId } });

    if (room && room.currentUserCount > 0) {
      await tx.room.update({
        where: { id: roomId },
        data: {
          currentUserCount: {
            decrement: 1,
          },
        },
      });
    }
  });

  await watchService.reassignWatchHostOnMemberLeave(roomId, userId);

  return {
    message: "Odadan ayrıldınız",
  };
}

export async function assertRoomExists(roomId: string) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room || !room.isActive) {
    throw new AppError(404, "Oda bulunamadı veya aktif değil");
  }

  return room;
}

export async function assertActiveRoomMember(userId: string, roomId: string) {
  await assertRoomExists(roomId);

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

  return membership;
}
