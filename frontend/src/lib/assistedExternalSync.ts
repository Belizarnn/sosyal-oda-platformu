import type { MediaMode, MediaProvider, RoomMediaState } from "@/types/watch";

export function isAssistedExternalProvider(provider: MediaProvider): boolean {
  return (
    provider === "DISNEY_PLUS" ||
    provider === "NETFLIX" ||
    provider === "PRIME_VIDEO"
  );
}

export function isAssistedExternalSyncMode(mode: MediaMode): boolean {
  return mode === "ASSISTED_EXTERNAL_SYNC";
}

export function isExternalSyncMode(mode: MediaMode): boolean {
  return mode === "EXTERNAL_SYNC" || mode === "ASSISTED_EXTERNAL_SYNC";
}

export function getProviderHomeUrl(provider: MediaProvider): string {
  switch (provider) {
    case "DISNEY_PLUS":
      return "https://www.disneyplus.com";
    case "NETFLIX":
      return "https://www.netflix.com";
    case "PRIME_VIDEO":
      return "https://www.primevideo.com";
    default:
      return "https://";
  }
}

export function getAssistedOpenUrl(mediaState: RoomMediaState): string {
  const customUrl = mediaState.externalUrl?.trim();
  if (customUrl) {
    return customUrl.startsWith("http") ? customUrl : `https://${customUrl}`;
  }
  return getProviderHomeUrl(mediaState.provider);
}

export function formatSeasonEpisode(
  season: number | null | undefined,
  episode: number | null | undefined,
): string | null {
  if (season == null && episode == null) {
    return null;
  }
  if (season != null && episode != null) {
    return `S${season} · B${episode}`;
  }
  if (season != null) {
    return `S${season}`;
  }
  return `B${episode}`;
}

export function formatStartOffsetMinutes(
  minutes: number | null | undefined,
): number | null {
  if (minutes == null || minutes <= 0) {
    return null;
  }
  return minutes;
}

export type ExternalSyncCommandType = "PAUSE" | "PLAY" | "SEEK" | "COUNTDOWN_START";

export interface ExternalSyncCommandPayload {
  roomId: string;
  command: ExternalSyncCommandType;
  currentTime: number;
  messageKey: string;
  provider: MediaProvider;
}
