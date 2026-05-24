export const ROOM_CATEGORIES = [
  "Oyun",
  "Film",
  "Ders",
  "Anime",
  "Müzik",
  "Sohbet",
  "Yazılım",
  "Spor",
] as const;

export type RoomCategory = (typeof ROOM_CATEGORIES)[number];

export type MockPresenceStatus =
  | "ONLINE"
  | "IDLE"
  | "IN_ROOM"
  | "WATCHING"
  | "STUDYING"
  | "LISTENING"
  | "GAMING"
  | "OFFLINE";

export interface User {
  id: string;
  username: string;
  handle: string;
  email: string;
  bio: string;
  avatarColor: string;
  interests: string[];
  presenceStatus: MockPresenceStatus;
  statusMessage?: string;
  badges: string[];
}

export interface Room {
  id: string;
  name: string;
  description: string;
  category: RoomCategory;
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  hostHandle: string;
  tags: string[];
}

export interface OnlineFriend {
  id: string;
  username: string;
  handle: string;
  avatarColor: string;
  presenceStatus: MockPresenceStatus;
  statusMessage?: string;
}

export interface TrendingRoom {
  room: Room;
  trendScore: number;
}

export interface SuggestedActivity {
  title: string;
  description: string;
  roomId: string;
}
