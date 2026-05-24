"use client";

import { Badge } from "@/components/ui/Badge";
import { SpeakingIndicator } from "@/components/voice/SpeakingIndicator";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import type { VoiceParticipant } from "@/types/voice";

interface VoiceParticipantCardProps {
  participant: VoiceParticipant;
}

export function VoiceParticipantCard({ participant }: VoiceParticipantCardProps) {
  const { t } = useLanguage();

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border bg-surface p-2.5 transition-all duration-300 sm:p-3",
        participant.isSpeaking
          ? "border-violet-400/40 bg-violet-400/5 shadow-[0_0_24px_rgba(167,139,250,0.12)]"
          : "border-border",
      )}
    >
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
      </div>
    </li>
  );
}
