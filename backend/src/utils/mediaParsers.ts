import { MediaMode, MediaProvider } from "@prisma/client";

import { AppError } from "./asyncHandler";
import {
  isAssistedExternalProvider,
  validateAssistedExternalInput,
  type AssistedExternalMetadataInput,
} from "./assistedExternalSync";
import {
  normalizeYouTubeWatchUrl,
  parseYouTubeVideoId,
} from "./parseYouTubeVideoId";

export { parseYouTubeVideoId } from "./parseYouTubeVideoId";

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function parseTwitchChannel(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^(www\.|m\.)/, "");

    if (host === "twitch.tv" || host === "www.twitch.tv") {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const channel = segments[0]?.toLowerCase();
      if (channel && /^[a-zA-Z0-9_]+$/.test(channel)) {
        return channel;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function parseKickChannel(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^(www\.|m\.)/, "");

    if (host === "kick.com") {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const channel = segments[0]?.toLowerCase();
      if (channel && /^[a-zA-Z0-9_-]+$/.test(channel)) {
        return channel;
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function buildEmbedUrl(
  provider: MediaProvider,
  parsedIdOrChannel: string,
  parentDomain?: string,
): string {
  switch (provider) {
    case MediaProvider.YOUTUBE:
      if (!YOUTUBE_ID_PATTERN.test(parsedIdOrChannel)) {
        throw new AppError(400, "Geçersiz YouTube video ID.");
      }
      return `https://www.youtube.com/embed/${parsedIdOrChannel}`;

    case MediaProvider.TWITCH: {
      const parent = parentDomain ?? "localhost";
      return `https://player.twitch.tv/?channel=${encodeURIComponent(parsedIdOrChannel)}&parent=${encodeURIComponent(parent)}`;
    }

    case MediaProvider.KICK:
      return `https://player.kick.com/${encodeURIComponent(parsedIdOrChannel)}`;

    default:
      throw new AppError(400, "Bu sağlayıcı için embed URL oluşturulamaz.");
  }
}

export function getMediaMode(provider: MediaProvider): MediaMode {
  switch (provider) {
    case MediaProvider.YOUTUBE:
    case MediaProvider.TWITCH:
      return MediaMode.EMBED;
    case MediaProvider.KICK:
      return MediaMode.EMBED;
    case MediaProvider.NETFLIX:
    case MediaProvider.DISNEY_PLUS:
    case MediaProvider.PRIME_VIDEO:
      return MediaMode.ASSISTED_EXTERNAL_SYNC;
    default:
      return MediaMode.EMBED;
  }
}

export function validateExternalProviderInput(
  provider: MediaProvider,
  input: AssistedExternalMetadataInput,
) {
  return validateAssistedExternalInput(provider, input);
}

export type ParsedEmbedMedia = {
  videoId: string | null;
  videoUrl: string;
  embedUrl: string;
};

export function parseEmbedMediaInput(
  provider: MediaProvider,
  url: string,
): ParsedEmbedMedia {
  switch (provider) {
    case MediaProvider.YOUTUBE: {
      const videoId = parseYouTubeVideoId(url);
      if (!videoId) {
        throw new AppError(400, "Geçerli bir YouTube bağlantısı gir.");
      }
      const videoUrl = normalizeYouTubeWatchUrl(videoId);
      return {
        videoId,
        videoUrl,
        embedUrl: buildEmbedUrl(provider, videoId),
      };
    }
    case MediaProvider.TWITCH: {
      const channel = parseTwitchChannel(url);
      if (!channel) {
        throw new AppError(400, "Geçerli bir Twitch kanal bağlantısı gir.");
      }
      const videoUrl = `https://www.twitch.tv/${channel}`;
      return {
        videoId: channel,
        videoUrl,
        embedUrl: buildEmbedUrl(provider, channel),
      };
    }
    case MediaProvider.KICK: {
      const channel = parseKickChannel(url);
      if (!channel) {
        throw new AppError(400, "Geçerli bir Kick kanal bağlantısı gir.");
      }
      const videoUrl = `https://kick.com/${channel}`;
      return {
        videoId: channel,
        videoUrl,
        embedUrl: buildEmbedUrl(provider, channel),
      };
    }
    default:
      throw new AppError(400, "Bu sağlayıcı uygulama içinde oynatılamaz.");
  }
}

export const MEDIA_PROVIDERS = [
  MediaProvider.YOUTUBE,
  MediaProvider.TWITCH,
  MediaProvider.KICK,
  MediaProvider.NETFLIX,
  MediaProvider.DISNEY_PLUS,
  MediaProvider.PRIME_VIDEO,
] as const;
