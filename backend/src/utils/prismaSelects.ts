import type { User } from "@prisma/client";

export const publicUserSelect = {
  id: true,
  username: true,
  handle: true,
  avatarUrl: true,
  presenceStatus: true,
} as const;

export const messageSenderSelect = publicUserSelect;

export type PublicUserFields = Pick<
  User,
  "id" | "username" | "handle" | "avatarUrl" | "presenceStatus"
>;

export const roomOwnerSelect = {
  id: true,
  username: true,
  handle: true,
  avatarUrl: true,
} as const;
