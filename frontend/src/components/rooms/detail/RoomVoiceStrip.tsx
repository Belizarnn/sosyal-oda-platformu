"use client";

import { VideoGrid } from "@/components/voice/video/VideoGrid";
import { VoiceParticipantList } from "@/components/voice/VoiceParticipantList";
import { useVoice } from "@/contexts/VoiceContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface RoomVoiceStripProps {
  roomId: string;
}

export function RoomVoiceStrip({ roomId }: RoomVoiceStripProps) {
  const { t } = useLanguage();
  const { isVoiceConnected, currentVoiceRoomId, participants } = useVoice();

  const connectedHere = isVoiceConnected && currentVoiceRoomId === roomId;

  if (!connectedHere || participants.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-3 rounded-xl border border-border bg-surface p-3">
      <VideoGrid participants={participants} />
      <div>
        <p className="mb-2 text-xs font-medium text-muted">{t("voice.inVoice")}</p>
        <VoiceParticipantList participants={participants} />
      </div>
    </div>
  );
}
