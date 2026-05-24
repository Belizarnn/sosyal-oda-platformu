export type MediaProvider =
  | "YOUTUBE"
  | "TWITCH"
  | "KICK"
  | "NETFLIX"
  | "DISNEY_PLUS"
  | "PRIME_VIDEO";

export type MediaMode = "EMBED" | "EXTERNAL_SYNC" | "ASSISTED_EXTERNAL_SYNC";

export type WatchAction = "PLAY" | "PAUSE" | "SEEK" | "START_TIMER";

export type VideoQueueStatus = "QUEUED" | "PLAYING" | "PLAYED" | "REMOVED";

export type WatchControlAction = "PLAY" | "PAUSE" | "SEEK";

export interface WatchHost {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
}

export interface RoomMediaState {
  id: string;
  roomId: string;
  provider: MediaProvider;
  mode: MediaMode;
  videoId: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  externalTitle: string | null;
  externalUrl: string | null;
  externalSeason: number | null;
  externalEpisode: number | null;
  externalStartOffsetMinutes: number | null;
  externalNotes: string | null;
  title: string | null;
  isPlaying: boolean;
  currentTime: number;
  hostUserId: string;
  countdownEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  host: WatchHost;
}

export interface WatchReadyUser {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  isReady: boolean;
}

export interface WatchProviderOption {
  provider: MediaProvider;
  label: string;
  description: string;
  mode: MediaMode;
  group: "embed" | "external";
}

export interface WatchQueueItem {
  id: string;
  roomId: string;
  videoId: string;
  videoUrl: string;
  title: string | null;
  position: number;
  status: VideoQueueStatus;
  addedById: string;
  createdAt: string;
  updatedAt: string;
  addedBy: WatchHost;
}

export interface WatchSyncPayload {
  roomId: string;
  provider?: MediaProvider;
  mode?: MediaMode;
  action: WatchAction;
  currentTime: number;
  isPlaying: boolean;
  hostUserId: string;
}

export interface WatchReadyUpdatedPayload {
  roomId: string;
  readyUsers: WatchReadyUser[];
}

export interface WatchCountdownStartedPayload {
  roomId: string;
  seconds: number;
  countdownEndsAt: string;
}

export interface WatchQueueUpdatedPayload {
  roomId: string;
  queue: WatchQueueItem[];
}

export interface WatchErrorPayload {
  message: string;
}

export interface WatchStateResponse {
  mediaState: RoomMediaState | null;
  readyUsers: WatchReadyUser[];
  host: WatchHost | null;
}

export interface WatchMediaStateResponse {
  mediaState: RoomMediaState;
}

export interface WatchQueueResponse {
  queue: WatchQueueItem[];
}

export interface WatchQueueItemResponse {
  item: WatchQueueItem;
}

export interface WatchPlayQueueItemResponse {
  item: WatchQueueItem;
  mediaState: RoomMediaState;
}

export interface SetWatchMediaInput {
  provider: MediaProvider;
  url?: string;
  externalTitle?: string;
  externalUrl?: string;
  externalSeason?: number;
  externalEpisode?: number;
  externalStartOffsetMinutes?: number;
  externalNotes?: string;
}

export const WATCH_PROVIDER_OPTIONS: WatchProviderOption[] = [
  {
    provider: "YOUTUBE",
    label: "YouTube",
    description: "Video linkini ekle, odada birlikte izle.",
    mode: "EMBED",
    group: "embed",
  },
  {
    provider: "TWITCH",
    label: "Twitch",
    description: "Canlı yayını oda içinde izle.",
    mode: "EMBED",
    group: "embed",
  },
  {
    provider: "KICK",
    label: "Kick",
    description: "Canlı yayını oda içinde izle.",
    mode: "EMBED",
    group: "embed",
  },
  {
    provider: "NETFLIX",
    label: "Netflix",
    description: "Platform dışında açılır. Kendi hesabınızla izlersiniz; oda senkronizasyon sağlar.",
    mode: "ASSISTED_EXTERNAL_SYNC",
    group: "external",
  },
  {
    provider: "DISNEY_PLUS",
    label: "Disney+",
    description: "Platform dışında açılır. Kendi hesabınızla izlersiniz; oda senkronizasyon sağlar.",
    mode: "ASSISTED_EXTERNAL_SYNC",
    group: "external",
  },
  {
    provider: "PRIME_VIDEO",
    label: "Prime Video",
    description: "Platform dışında açılır. Kendi hesabınızla izlersiniz; oda senkronizasyon sağlar.",
    mode: "ASSISTED_EXTERNAL_SYNC",
    group: "external",
  },
];

export function getProviderLabel(provider: MediaProvider): string {
  return WATCH_PROVIDER_OPTIONS.find((option) => option.provider === provider)?.label ?? provider;
}
