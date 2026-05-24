"use client";

import { VideoTile } from "@/components/voice/video/VideoTile";
import type { VoiceParticipant } from "@/types/voice";

interface VideoGridProps {
  participants: VoiceParticipant[];
}

export function VideoGrid({ participants }: VideoGridProps) {
  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {participants.map((participant) => (
        <VideoTile key={participant.id} participant={participant} />
      ))}
    </div>
  );
}
