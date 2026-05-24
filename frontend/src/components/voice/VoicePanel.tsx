"use client";

import { useRouter } from "next/navigation";
import { VoiceConnectionStatus } from "@/components/voice/VoiceConnectionStatus";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { VoiceParticipantList } from "@/components/voice/VoiceParticipantList";
import { VideoGrid } from "@/components/voice/video/VideoGrid";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useVoice } from "@/contexts/VoiceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getToken } from "@/lib/auth";

interface VoicePanelProps {
  roomId: string;
  roomName: string;
  isMember: boolean;
  startMicMuted?: boolean;
}

export function VoicePanel({
  roomId,
  roomName,
  isMember,
  startMicMuted = false,
}: VoicePanelProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    isVoiceConnected,
    currentVoiceRoomId,
    currentVoiceRoomName,
    isConnecting,
    connectionError,
    participants,
    isMuted,
    isDeafened,
    isCameraEnabled,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMicrophone,
    toggleDeafen,
    toggleCamera,
    clearConnectionError,
  } = useVoice();

  const isAuthenticated = Boolean(getToken());
  const isConnectedHere = isVoiceConnected && currentVoiceRoomId === roomId;
  const isConnectedElsewhere =
    isVoiceConnected && currentVoiceRoomId !== null && currentVoiceRoomId !== roomId;

  async function handleJoin() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    clearConnectionError();

    try {
      await joinVoiceRoom(roomId, roomName, { startMicMuted });
    } catch {
      // connectionError VoiceProvider tarafından set edilir
    }
  }

  async function handleSwitchRoom() {
    clearConnectionError();

    try {
      await joinVoiceRoom(roomId, roomName, {
        startMicMuted,
        forceSwitch: true,
      });
    } catch {
      // connectionError VoiceProvider tarafından set edilir
    }
  }

  return (
    <Card glow className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">{t("voice.title")}</h2>
        <p className="mt-1 text-xs text-muted">{t("voice.subtitle")}</p>
      </div>

      {!isMember ? (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {t("voice.memberRequired")}
        </p>
      ) : null}

      {!isAuthenticated ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
          {t("voice.loginRequired")}
        </p>
      ) : null}

      {connectionError ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {connectionError}
        </p>
      ) : null}

      {isConnectedElsewhere ? (
        <div className="space-y-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
          <p className="text-xs text-amber-100">{t("voice.otherRoomConnected")}</p>
          <p className="text-sm font-medium text-foreground">{currentVoiceRoomName}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => router.push(`/rooms/${currentVoiceRoomId}`)}
            >
              {t("voice.goToRoom")}
            </Button>
            <Button
              size="sm"
              onClick={() => void handleSwitchRoom()}
              disabled={isConnecting}
            >
              {isConnecting ? t("voice.joining") : t("voice.switchRoom")}
            </Button>
          </div>
        </div>
      ) : null}

      {isConnectedHere ? (
        <div className="flex flex-col gap-3">
          <p className="rounded-xl border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs text-violet-100">
            {t("voice.connectedToRoom")}
          </p>

          <VoiceConnectionStatus />

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

          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium text-muted">{t("voice.videoSection")}</p>
            <VideoGrid participants={participants} />
          </div>

          <div className="border-t border-border pt-3">
            <p className="mb-2 text-xs font-medium text-muted">{t("voice.inVoice")}</p>
            <VoiceParticipantList participants={participants} />
          </div>
        </div>
      ) : null}

      {!isConnectedHere && !isConnectedElsewhere ? (
        <Button
          onClick={() => void handleJoin()}
          disabled={!isMember || !isAuthenticated || isConnecting}
          size="lg"
          className="w-full sm:max-w-xs"
        >
          {isConnecting ? t("voice.joining") : t("voice.joinVoice")}
        </Button>
      ) : null}
    </Card>
  );
}
