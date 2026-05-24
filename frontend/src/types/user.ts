export type PresenceStatus =
  | "ONLINE"
  | "IDLE"
  | "IN_ROOM"
  | "WATCHING"
  | "STUDYING"
  | "LISTENING"
  | "GAMING"
  | "OFFLINE";

export interface ProfileActivity {
  memberSince: string;
  recentRooms: {
    id: string;
    name: string;
    category: string;
  }[];
}

export interface UserProfile {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  statusMessage: string | null;
  presenceStatus: PresenceStatus;
  profileInterests: string[];
  createdAt: string;
  lastSeenAt: string | null;
  isPremium?: boolean;
  premiumBadgeVisible?: boolean;
  premiumProfileFrame?: string | null;
  premiumAvatarEffect?: string | null;
  activity: ProfileActivity;
}

export interface UpdateProfileInput {
  username?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  bio?: string | null;
  statusMessage?: string | null;
  profileInterests?: string[];
}

export const PROFILE_INTEREST_SUGGESTIONS = [
  "Oyun",
  "Film",
  "Anime",
  "Ders",
  "Yazılım",
  "Müzik",
  "Spor",
] as const;

export const MOCK_PROFILE_BADGES = [
  "Kurucu Üye",
  "Erken Kullanıcı",
  "Sosyal Kaşif",
] as const;
