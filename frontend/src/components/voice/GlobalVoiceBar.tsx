"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { SpeakingIndicator } from "@/components/voice/SpeakingIndicator";
import { useVoice } from "@/contexts/VoiceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

export function GlobalVoiceBar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const {
    isVoiceConnected,
    currentVoiceRoomName,
    currentVoiceRoomId,
    participants,
    activeSpeakers,
    isMuted,
    isDeafened,
    isCameraEnabled,
    isConnecting,
    leaveVoiceRoom,
    toggleMicrophone,
    toggleDeafen,
    toggleCamera,
  } = useVoice();

  if (!isVoiceConnected || !currentVoiceRoomId) {
    return null;
  }

  const isOnActiveRoomPage =
    pathname === `/rooms/${currentVoiceRoomId}` ||
    pathname.startsWith(`/rooms/${currentVoiceRoomId}/`);

  if (isOnActiveRoomPage) {
    return null;
  }

  const speakingParticipants = participants.filter((participant) =>
    activeSpeakers.includes(participant.id),
  );

  return (
    <div
      className={cn(
        "pointer-events-none fixed z-40",
        "bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom,0px)+0.75rem)] left-3 right-3",
        "lg:bottom-4 lg:left-auto lg:right-6 lg:w-[min(100%,24rem)]",
      )}
      aria-live="polite"
    >
      <div
        className={cn(
          "pointer-events-auto rounded-xl border border-border bg-surface p-3 shadow-[0_8px_24px_var(--shadow)]",
        )}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted">
              {t("voice.globalConnected")}
            </p>
            <Link
              href={`/rooms/${currentVoiceRoomId}`}
              className="mt-0.5 block truncate text-sm font-semibold text-foreground hover:text-accent"
            >
              {currentVoiceRoomName}
            </Link>
            <p className="mt-1 text-[11px] text-muted">
              {isMuted ? t("voice.mutedBadge") : t("voice.micOn")}
              {" · "}
              {isCameraEnabled ? t("voice.cameraOn") : t("voice.cameraOffShort")}
            </p>
          </div>

          {speakingParticipants.length > 0 ? (
            <div className="flex -space-x-2">
              {speakingParticipants.slice(0, 3).map((participant) => (
                <SpeakingIndicator
                  key={participant.id}
                  name={participant.username}
                  isSpeaking
                  size="sm"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-3 border-t border-border/60 pt-3">
          <VoiceControls
            isConnected
            isMuted={isMuted}
            isDeafened={isDeafened}
            isCameraEnabled={isCameraEnabled}
            disabled={isConnecting}
            onToggleMute={() => void toggleMicrophone()}
            onToggleCamera={() => void toggleCamera()}
            onToggleDeafen={() => void toggleDeafen()}
            onDisconnect={() => void leaveVoiceRoom()}
            disconnectLabel={t("voice.leaveVoice")}
          />
        </div>
      </div>
    </div>
  );
}
