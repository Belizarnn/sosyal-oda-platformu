"use client";

import { VideoTrack } from "@livekit/components-react";
import { Track } from "livekit-client";
import { useMemo } from "react";
import { useTracks } from "@livekit/components-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { CameraOffPlaceholder } from "@/components/voice/video/CameraOffPlaceholder";
import { cn } from "@/lib/cn";
import type { VoiceParticipant } from "@/types/voice";

interface VideoTileProps {
  participant: VoiceParticipant;
}

export function VideoTile({ participant }: VideoTileProps) {
  const { t } = useLanguage();
  const tracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: false },
  );

  const trackRef = useMemo(
    () => tracks.find((track) => track.participant.identity === participant.id),
    [participant.id, tracks],
  );

  const hasVideo =
    participant.isCameraEnabled &&
    trackRef &&
    trackRef.publication &&
    !trackRef.publication.isMuted;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border bg-[rgba(15,23,42,0.72)] transition-all duration-300",
        participant.isSpeaking
          ? "border-violet-400/50 shadow-[0_0_24px_rgba(167,139,250,0.18)] voice-speaking-ring"
          : "border-border/80",
      )}
    >
      <div className="relative aspect-video w-full">
        {hasVideo && trackRef ? (
          <VideoTrack
            trackRef={trackRef}
            className="h-full w-full object-cover"
          />
        ) : (
          <CameraOffPlaceholder name={participant.username} />
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
          <p className="truncate text-sm font-medium text-white">
            {participant.username}
          </p>
          <p className="truncate text-xs text-white/70">@{participant.handle}</p>
        </div>

        <div className="absolute right-2 top-2">
          {participant.isMuted ? (
            <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-white/90">
              {t("voice.mutedBadge")}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
