import type { Room, User } from "@prisma/client";

export type SafeRoom = Omit<Room, "passwordHash">;

export function sanitizeRoom(room: Room): SafeRoom {
  const { passwordHash: _passwordHash, ...safeRoom } = room;
  return safeRoom;
}

export interface PublicOwner {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
}

export type OwnerLike = Pick<User, "id" | "username" | "handle" | "avatarUrl">;

export function sanitizeOwner(user: OwnerLike): PublicOwner {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
  };
}

export interface PublicMemberUser {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  presenceStatus: User["presenceStatus"];
}

export type MemberUserLike = Pick<
  User,
  "id" | "username" | "handle" | "avatarUrl" | "presenceStatus"
>;

export function sanitizeMemberUser(user: MemberUserLike): PublicMemberUser {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    presenceStatus: user.presenceStatus,
  };
}
