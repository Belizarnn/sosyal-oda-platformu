import bcrypt from "bcrypt";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";
import {
  formatPublicProfile,
  normalizeProfileInterests,
  sanitizeProfileUrls,
  sanitizeUser,
} from "../../utils/sanitizeUser";
import { trimAndLimit } from "../../utils/sanitizeInput";
import type {
  ChangePasswordInput,
  UpdatePreferencesInput,
  UpdatePresenceInput,
  UpdateProfileInput,
} from "./user.schemas";

const BCRYPT_ROUNDS = 12;

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  return sanitizeUser(user);
}

export async function getUserByHandle(handle: string) {
  const user = await prisma.user.findUnique({
    where: { handle },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  const memberships = await prisma.roomMember.findMany({
    where: {
      userId: user.id,
      leftAt: null,
      isBanned: false,
    },
    include: {
      room: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
    },
    orderBy: {
      joinedAt: "desc",
    },
    take: 3,
  });

  const recentRooms = memberships.map((membership) => ({
    id: membership.room.id,
    name: membership.room.name,
    category: membership.room.category,
  }));

  return formatPublicProfile(user, recentRooms);
}

export async function updateUserPresence(
  userId: string,
  input: UpdatePresenceInput,
) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      presenceStatus: input.presenceStatus,
      ...(input.statusMessage !== undefined
        ? {
            statusMessage: input.statusMessage
              ? trimAndLimit(input.statusMessage, 80)
              : null,
          }
        : {}),
      lastSeenAt: new Date(),
    },
  });

  return sanitizeUser(user);
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput,
) {
  let urlFields: ReturnType<typeof sanitizeProfileUrls> = {};

  try {
    urlFields = sanitizeProfileUrls({
      avatarUrl: input.avatarUrl,
      bannerUrl: input.bannerUrl,
    });
  } catch (error) {
    throw new AppError(
      400,
      error instanceof Error ? error.message : "Geçersiz URL",
    );
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.username !== undefined
        ? { username: trimAndLimit(input.username, 40) }
        : {}),
      ...(input.bio !== undefined
        ? { bio: input.bio ? trimAndLimit(input.bio, 240) : null }
        : {}),
      ...(input.statusMessage !== undefined
        ? {
            statusMessage: input.statusMessage
              ? trimAndLimit(input.statusMessage, 80)
              : null,
          }
        : {}),
      ...(input.profileInterests !== undefined
        ? {
            profileInterests: normalizeProfileInterests(input.profileInterests),
          }
        : {}),
      ...urlFields,
    },
  });

  return sanitizeUser(user);
}

export async function changeUserPassword(
  userId: string,
  input: ChangePasswordInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  const passwordValid = await bcrypt.compare(
    input.currentPassword,
    user.passwordHash,
  );

  if (!passwordValid) {
    throw new AppError(403, "Mevcut şifre hatalı.");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: "Şifre başarıyla güncellendi." };
}

export async function updateUserPreferences(
  userId: string,
  input: UpdatePreferencesInput,
) {
  const { updateNotificationPreferences } = await import(
    "../notifications/notification.service"
  );

  return updateNotificationPreferences(userId, input);
}
