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
    const host = parsed.hostname.replace(/^(www\.|m\.)/, "");

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

export function normalizeYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
