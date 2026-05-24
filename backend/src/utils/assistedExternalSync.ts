import { MediaMode, MediaProvider } from "@prisma/client";
import { AppError } from "./asyncHandler";

export const ASSISTED_EXTERNAL_PROVIDERS = [
  MediaProvider.DISNEY_PLUS,
  MediaProvider.NETFLIX,
  MediaProvider.PRIME_VIDEO,
] as const;

export type AssistedExternalProvider = (typeof ASSISTED_EXTERNAL_PROVIDERS)[number];

export function isAssistedExternalProvider(
  provider: MediaProvider,
): provider is AssistedExternalProvider {
  return (ASSISTED_EXTERNAL_PROVIDERS as readonly MediaProvider[]).includes(provider);
}

export function isExternalSyncMode(mode: MediaMode): boolean {
  return (
    mode === MediaMode.EXTERNAL_SYNC || mode === MediaMode.ASSISTED_EXTERNAL_SYNC
  );
}

export function isAssistedExternalSyncMode(mode: MediaMode): boolean {
  return mode === MediaMode.ASSISTED_EXTERNAL_SYNC;
}

export function getProviderHomeUrl(provider: MediaProvider): string {
  switch (provider) {
    case MediaProvider.DISNEY_PLUS:
      return "https://www.disneyplus.com";
    case MediaProvider.NETFLIX:
      return "https://www.netflix.com";
    case MediaProvider.PRIME_VIDEO:
      return "https://www.primevideo.com";
    default:
      return "https://";
  }
}

export function assertProviderAllowsMode(provider: MediaProvider, mode: MediaMode): void {
  if (isAssistedExternalProvider(provider) && mode === MediaMode.EMBED) {
    throw new AppError(
      400,
      "Bu platform uygulama içinde oynatılamaz. Yönlendirmeli senkron izleme kullanılmalıdır.",
    );
  }

  if (isAssistedExternalProvider(provider) && mode === MediaMode.EXTERNAL_SYNC) {
    throw new AppError(
      400,
      "Bu platform için yalnızca yönlendirmeli senkron izleme modu kullanılabilir.",
    );
  }
}

export type AssistedExternalMetadataInput = {
  externalTitle?: string | null;
  externalUrl?: string | null;
  externalSeason?: number | null;
  externalEpisode?: number | null;
  externalStartOffsetMinutes?: number | null;
  externalNotes?: string | null;
};

export type AssistedExternalMetadata = {
  externalTitle: string;
  externalUrl: string | null;
  externalSeason: number | null;
  externalEpisode: number | null;
  externalStartOffsetMinutes: number | null;
  externalNotes: string | null;
};

const EXTERNAL_DOMAIN_HINTS: Record<string, string[]> = {
  [MediaProvider.NETFLIX]: ["netflix.com"],
  [MediaProvider.DISNEY_PLUS]: ["disneyplus.com"],
  [MediaProvider.PRIME_VIDEO]: ["primevideo.com", "amazon.com"],
};

export function validateAssistedExternalInput(
  provider: MediaProvider,
  input: AssistedExternalMetadataInput,
): AssistedExternalMetadata {
  const title = input.externalTitle?.trim() ?? "";

  if (!title) {
    throw new AppError(400, "İçerik adı zorunludur.");
  }

  if (title.length > 200) {
    throw new AppError(400, "İçerik adı en fazla 200 karakter olabilir.");
  }

  const url = input.externalUrl?.trim() || null;

  if (url) {
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      const host = parsed.hostname.replace(/^(www\.|m\.)/, "");
      const hints = EXTERNAL_DOMAIN_HINTS[provider];

      if (hints && !hints.some((hint) => host === hint || host.endsWith(`.${hint}`))) {
        throw new AppError(
          400,
          "Opsiyonel bağlantı beklenen platform domainine ait görünmüyor.",
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(400, "Geçerli bir opsiyonel bağlantı gir.");
    }
  }

  const season =
    input.externalSeason === undefined || input.externalSeason === null
      ? null
      : input.externalSeason;
  const episode =
    input.externalEpisode === undefined || input.externalEpisode === null
      ? null
      : input.externalEpisode;

  if (season !== null && (!Number.isInteger(season) || season < 0 || season > 999)) {
    throw new AppError(400, "Sezon bilgisi geçersiz.");
  }

  if (episode !== null && (!Number.isInteger(episode) || episode < 0 || episode > 999)) {
    throw new AppError(400, "Bölüm bilgisi geçersiz.");
  }

  const startOffset =
    input.externalStartOffsetMinutes === undefined ||
    input.externalStartOffsetMinutes === null
      ? null
      : input.externalStartOffsetMinutes;

  if (
    startOffset !== null &&
    (Number.isNaN(startOffset) || startOffset < 0 || startOffset > 24 * 60)
  ) {
    throw new AppError(400, "Başlangıç zamanı geçersiz.");
  }

  const notes = input.externalNotes?.trim() || null;

  if (notes && notes.length > 500) {
    throw new AppError(400, "Not en fazla 500 karakter olabilir.");
  }

  return {
    externalTitle: title,
    externalUrl: url,
    externalSeason: season,
    externalEpisode: episode,
    externalStartOffsetMinutes: startOffset,
    externalNotes: notes,
  };
}

export type ExternalSyncCommandType = "PAUSE" | "PLAY" | "SEEK" | "COUNTDOWN_START";

export function getExternalSyncCommandMessageKey(
  command: ExternalSyncCommandType,
): string {
  switch (command) {
    case "PAUSE":
      return "watch.assisted.command.pause";
    case "PLAY":
      return "watch.assisted.command.play";
    case "SEEK":
      return "watch.assisted.command.seek";
    case "COUNTDOWN_START":
      return "watch.assisted.command.countdown";
  }
}

export type ExternalSyncCommandPayload = {
  roomId: string;
  command: ExternalSyncCommandType;
  currentTime: number;
  messageKey: string;
  provider: MediaProvider;
};
