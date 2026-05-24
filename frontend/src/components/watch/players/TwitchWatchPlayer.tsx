"use client";

import { getTwitchEmbedUrl } from "@/lib/watchEmbed";

interface TwitchWatchPlayerProps {
  channel: string;
}

export function TwitchWatchPlayer({ channel }: TwitchWatchPlayerProps) {
  const embedUrl = getTwitchEmbedUrl(channel);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black shadow-[0_0_30px_var(--glow)]">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          title="Twitch watch party player"
          className="absolute inset-0 h-full w-full"
          allowFullScreen
        />
      </div>
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted">
        Canlı yayın — play/pause senkronu zorunlu değil. Chat ve voice Sosyal Oda&apos;da devam eder.
      </p>
    </div>
  );
}
