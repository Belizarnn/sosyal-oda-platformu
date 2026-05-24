export type RoomType =
  | "PUBLIC"
  | "PRIVATE"
  | "INVITE_ONLY"
  | "PASSWORD_PROTECTED";

export type RoomCategory =
  | "GAME"
  | "FILM"
  | "STUDY"
  | "ANIME"
  | "MUSIC"
  | "CHAT"
  | "SOFTWARE"
  | "SPORTS";

export type RoomMemberRole = "OWNER" | "MODERATOR" | "MEMBER";

export interface RoomOwner {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: RoomCategory;
  type: RoomType;
  ownerId: string;
  currentUserCount: number;
  maxUserCount: number;
  isActive: boolean;
  inviteCode: string;
  inviteEnabled: boolean;
  inviteCreatedAt?: string | null;
  inviteUpdatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: RoomOwner;
}

export interface RoomListItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: RoomCategory;
  type: RoomType;
  owner: RoomOwner;
  currentUserCount: number;
  maxUserCount: number;
  inviteCode: string;
  isActive: boolean;
  createdAt: string;
  isMember?: boolean;
}

export interface RoomMemberUser {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  presenceStatus: string;
}

export interface RoomMember {
  id: string;
  userId: string;
  role: RoomMemberRole;
  joinedAt: string;
  isMuted: boolean;
  isBanned: boolean;
  mutedUntil: string | null;
  user: RoomMemberUser;
}

export interface RoomDetailResponse {
  room: Room;
  owner: RoomOwner;
  members: RoomMember[];
  currentUserCount: number;
  isMember: boolean;
  currentUserRole: RoomMemberRole | null;
  canManageInvite: boolean;
}

export interface CreateRoomInput {
  name: string;
  description?: string | null;
  category: RoomCategory;
  type: RoomType;
  maxUserCount?: number;
  password?: string;
}

export interface RoomFilters {
  category?: RoomCategory;
  search?: string;
  type?: RoomType;
  limit?: number;
  cursor?: string;
}

export interface RoomListResponse {
  rooms: RoomListItem[];
  nextCursor?: string | null;
}

export const ROOM_CATEGORY_OPTIONS: {
  value: RoomCategory;
  label: string;
}[] = [
  { value: "GAME", label: "Oyun" },
  { value: "FILM", label: "Film" },
  { value: "STUDY", label: "Ders" },
  { value: "ANIME", label: "Anime" },
  { value: "MUSIC", label: "Müzik" },
  { value: "CHAT", label: "Sohbet" },
  { value: "SOFTWARE", label: "Yazılım" },
  { value: "SPORTS", label: "Spor" },
];

export const ROOM_TYPE_OPTIONS: {
  value: RoomType;
  label: string;
}[] = [
  { value: "PUBLIC", label: "Public" },
  { value: "PRIVATE", label: "Private" },
  { value: "INVITE_ONLY", label: "Invite Only" },
  { value: "PASSWORD_PROTECTED", label: "Şifreli" },
];

export function getRoomCategoryLabel(category: RoomCategory): string {
  return (
    ROOM_CATEGORY_OPTIONS.find((item) => item.value === category)?.label ??
    category
  );
}

import type { DiscoverRoom } from "@/types/discover";

export function discoverRoomToListItem(room: DiscoverRoom): RoomListItem {
  return {
    id: room.id,
    name: room.name,
    slug: room.slug,
    description: room.description,
    category: room.category,
    type: room.type,
    owner: room.owner,
    currentUserCount: room.currentUserCount,
    maxUserCount: room.maxUserCount,
    inviteCode: room.inviteCode,
    isActive: true,
    createdAt: room.createdAt,
  };
}

export function getRoomTypeLabel(type: RoomType): string {
  return ROOM_TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type;
}
