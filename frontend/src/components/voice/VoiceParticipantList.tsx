"use client";

import type { VoiceParticipant } from "@/types/voice";
import { VoiceParticipantCard } from "@/components/voice/VoiceParticipantCard";
import { useLanguage } from "@/contexts/LanguageContext";

interface VoiceParticipantListProps {
  participants: VoiceParticipant[];
}

export function VoiceParticipantList({
  participants,
}: VoiceParticipantListProps) {
  const { t } = useLanguage();

  if (participants.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-surface p-4 text-center text-xs text-muted">
        {t("voice.emptyParticipants")}
      </p>
    );
  }

  return (
    <ul className="max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-64">
      {participants.map((participant) => (
        <VoiceParticipantCard key={participant.id} participant={participant} />
      ))}
    </ul>
  );
}
