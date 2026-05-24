"use client";

import { getKickEmbedUrl } from "@/lib/watchEmbed";

interface KickWatchPlayerProps {
  channel: string;
}

export function KickWatchPlayer({ channel }: KickWatchPlayerProps) {
  const embedUrl = getKickEmbedUrl(channel);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black shadow-[0_0_30px_var(--glow)]">
      <div className="relative aspect-video w-full">
        <iframe
          src={embedUrl}
          title="Kick watch party player"
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
