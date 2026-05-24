const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

function isValidYouTubeId(value: string | null | undefined): value is string {
  return Boolean(value && YOUTUBE_ID_PATTERN.test(value));
}

function extractIdFromPath(pathname: string, segmentIndex: number): string | null {
  const id = pathname.split("/").filter(Boolean)[segmentIndex];
  return isValidYouTubeId(id) ? id : null;
}

export function parseYouTubeVideoId(url: string): string | null {
  const trimmed = url.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "youtube.com");

    if (host === "youtu.be") {
      return extractIdFromPath(parsed.pathname, 0);
    }

    if (host === "youtube.com") {
      if (parsed.pathname === "/watch" || parsed.pathname.startsWith("/watch/")) {
        const id = parsed.searchParams.get("v");
        return isValidYouTubeId(id) ? id : null;
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return extractIdFromPath(parsed.pathname, 1);
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        return extractIdFromPath(parsed.pathname, 1);
      }

      if (parsed.pathname.startsWith("/v/")) {
        return extractIdFromPath(parsed.pathname, 1);
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeEmbedUrl(
  videoId: string,
  options?: { start?: number; autoplay?: boolean },
): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
  });

  if (options?.start && options.start > 0) {
    params.set("start", String(Math.floor(options.start)));
  }

  if (options?.autoplay) {
    params.set("autoplay", "1");
  }

  // TODO (Sprint 25+): enablejsapi=1 ile YouTube IFrame Player API kullanılacak;
  // play/pause/seek iframe player state ile senkronize edilecek.
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
