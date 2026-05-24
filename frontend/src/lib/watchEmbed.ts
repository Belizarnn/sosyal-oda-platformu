export function getEmbedParentDomain(): string {
  if (typeof window !== "undefined" && window.location.hostname) {
    return window.location.hostname;
  }

  const envDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.trim();
  if (envDomain) {
    return envDomain.replace(/^https?:\/\//, "").split("/")[0] ?? "localhost";
  }

  return "localhost";
}

export function getTwitchEmbedUrl(channel: string, parentDomain?: string): string {
  const parent = parentDomain ?? getEmbedParentDomain();
  const params = new URLSearchParams({
    channel,
    parent,
  });
  return `https://player.twitch.tv/?${params.toString()}`;
}

export function getKickEmbedUrl(channel: string): string {
  return `https://player.kick.com/${encodeURIComponent(channel)}`;
}
