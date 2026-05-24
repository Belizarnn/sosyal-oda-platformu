"use client";

import { getYouTubeEmbedUrl } from "@/lib/youtube";

interface YouTubePlayerProps {
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  syncKey?: number;
}

export function YouTubePlayer({
  videoId,
  currentTime,
  isPlaying,
  syncKey = 0,
}: YouTubePlayerProps) {
  const embedUrl = getYouTubeEmbedUrl(videoId, {
    start: Math.floor(currentTime),
    autoplay: isPlaying,
  });

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-black shadow-[0_0_30px_var(--glow)]">
      <div className="relative aspect-video w-full">
        <iframe
          key={`${videoId}-${syncKey}`}
          src={embedUrl}
          title="YouTube watch party player"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <p className="border-t border-border px-3 py-2 text-[11px] text-muted">
        {/* TODO: YouTube IFrame Player API ile play/pause/seek gerçek player üzerinde senkronize edilecek. */}
        Şimdilik embed + backend state senkronizasyonu kullanılıyor.
      </p>
    </div>
  );
}
