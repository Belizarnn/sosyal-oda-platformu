import type { RoomCategory } from "@/types/room";

export type DiscoverSort = "trending" | "newest" | "active" | "recommended";

export type DiscoverCategoryFilter = RoomCategory | "ALL";

export interface DiscoverRoomOwner {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
}

export interface DiscoverRoom {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: RoomCategory;
  type: "PUBLIC";
  currentUserCount: number;
  maxUserCount: number;
  inviteCode: string;
  createdAt: string;
  owner: DiscoverRoomOwner;
}

export interface DiscoverRoomsMeta {
  total: number;
  sort: DiscoverSort;
  category: RoomCategory | null;
  search: string | null;
}

export interface DiscoverRoomsResponse {
  rooms: DiscoverRoom[];
  nextCursor?: string | null;
  meta: DiscoverRoomsMeta;
}

export interface DiscoverFilters {
  search?: string;
  category?: RoomCategory;
  sort?: DiscoverSort;
  limit?: number;
  cursor?: string;
}

export const DISCOVER_SORT_OPTIONS: {
  value: DiscoverSort;
  label: string;
}[] = [
  { value: "trending", label: "Trend" },
  { value: "newest", label: "Yeni" },
  { value: "active", label: "Aktif" },
  { value: "recommended", label: "Önerilen" },
];

export const DISCOVER_CATEGORY_OPTIONS: {
  value: DiscoverCategoryFilter;
  label: string;
}[] = [
  { value: "ALL", label: "Tümü" },
  { value: "GAME", label: "Oyun" },
  { value: "FILM", label: "Film" },
  { value: "STUDY", label: "Ders" },
  { value: "ANIME", label: "Anime" },
  { value: "MUSIC", label: "Müzik" },
  { value: "CHAT", label: "Sohbet" },
  { value: "SOFTWARE", label: "Yazılım" },
  { value: "SPORTS", label: "Spor" },
];
