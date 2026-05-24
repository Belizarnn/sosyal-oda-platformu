"use client";

import { Badge } from "@/components/ui/Badge";
import { SpeakingIndicator } from "@/components/voice/SpeakingIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import type { VoiceParticipant } from "@/types/voice";

interface VoiceParticipantCardProps {
  participant: VoiceParticipant;
}

export function VoiceParticipantCard({ participant }: VoiceParticipantCardProps) {
  const { t } = useLanguage();

  return (
    <li className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5 sm:p-3">
      <SpeakingIndicator
        name={participant.username}
        isSpeaking={participant.isSpeaking}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{participant.username}</p>
        <p className="truncate text-xs text-muted">@{participant.handle}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {participant.isMuted ? (
          <Badge variant="muted">{t("voice.mutedBadge")}</Badge>
        ) : null}
        {participant.isDeafened ? (
          <Badge variant="muted">{t("voice.deafenedBadge")}</Badge>
        ) : null}
        {participant.isSpeaking ? (
          <span className="text-[10px] font-medium text-accent">
            {t("voice.speaking")}
          </span>
        ) : null}
      </div>
    </li>
  );
}
