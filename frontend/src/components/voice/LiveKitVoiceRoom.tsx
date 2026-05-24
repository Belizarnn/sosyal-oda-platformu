"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useSpeakingParticipants,
} from "@livekit/components-react";
import "@livekit/components-styles";
import type { Participant } from "livekit-client";
import { MediaDeviceFailure } from "livekit-client";
import { VoiceConnectionStatus } from "@/components/voice/VoiceConnectionStatus";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { VoiceParticipantList } from "@/components/voice/VoiceParticipantList";
import { useLanguage } from "@/contexts/LanguageContext";
import type { VoiceParticipant } from "@/types/voice";

interface LiveKitVoiceRoomProps {
  token: string;
  livekitUrl: string;
  startMicMuted?: boolean;
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (message: string) => void;
}

function mapParticipant(
  participant: Participant,
  speakingIds: Set<string>,
  localDeafened: boolean,
  isLocal: boolean,
): VoiceParticipant {
  return {
    id: participant.identity,
    username: participant.name || participant.identity,
    handle: participant.name || participant.identity,
    isMuted: !participant.isMicrophoneEnabled,
    isDeafened: isLocal ? localDeafened : false,
    isSpeaking: speakingIds.has(participant.identity),
  };
}

function VoiceRoomContent({
  startMicMuted = false,
  onConnected,
  onDisconnected,
  onError,
}: Omit<LiveKitVoiceRoomProps, "token" | "livekitUrl">) {
  const { t } = useLanguage();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const speakingParticipants = useSpeakingParticipants();
  const [isMuted, setIsMuted] = useState(startMicMuted);
  const [isDeafened, setIsDeafened] = useState(false);
  const [controlsLoading, setControlsLoading] = useState(false);
  const [micInitialized, setMicInitialized] = useState(false);

  const speakingIds = useMemo(
    () => new Set(speakingParticipants.map((participant) => participant.identity)),
    [speakingParticipants],
  );

  const voiceParticipants = useMemo(() => {
    const mapped = participants.map((participant) =>
      mapParticipant(
        participant,
        speakingIds,
        isDeafened,
        participant.identity === localParticipant.identity,
      ),
    );

    return mapped.sort((left, right) => {
      if (left.id === localParticipant.identity) {
        return -1;
      }

      if (right.id === localParticipant.identity) {
        return 1;
      }

      return left.username.localeCompare(right.username, "tr");
    });
  }, [participants, speakingIds, isDeafened, localParticipant.identity]);

  useEffect(() => {
    if (micInitialized || !localParticipant) {
      return;
    }

    async function initializeMicrophone() {
      try {
        await localParticipant.setMicrophoneEnabled(!startMicMuted);
        setIsMuted(startMicMuted);
        setMicInitialized(true);
        onConnected();
      } catch {
        setIsMuted(true);
        setMicInitialized(true);
        onError(t("voice.micPermissionDenied"));
      }
    }

    void initializeMicrophone();
  }, [localParticipant, micInitialized, onConnected, onError, startMicMuted, t]);

  const handleToggleMute = useCallback(async () => {
    setControlsLoading(true);

    try {
      const nextMuted = !isMuted;
      await localParticipant.setMicrophoneEnabled(!nextMuted);
      setIsMuted(nextMuted);
    } catch {
      onError(t("voice.micPermissionDenied"));
    } finally {
      setControlsLoading(false);
    }
  }, [isMuted, localParticipant, onError, t]);

  const handleToggleDeafen = useCallback(async () => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);

    if (nextDeafened && !isMuted) {
      setControlsLoading(true);

      try {
        await localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      } catch {
        onError(t("voice.micPermissionDenied"));
      } finally {
        setControlsLoading(false);
      }
    }
  }, [isDeafened, isMuted, localParticipant, onError, t]);

  const handleDisconnect = useCallback(() => {
    void room.disconnect();
  }, [room]);

  return (
    <div className="flex flex-col gap-3">
      <VoiceConnectionStatus />

      <VoiceControls
        isConnected
        isMuted={isMuted}
        isDeafened={isDeafened}
        disabled={controlsLoading}
        onToggleMute={() => void handleToggleMute()}
        onToggleDeafen={() => void handleToggleDeafen()}
        onDisconnect={handleDisconnect}
      />

      {!isDeafened ? <RoomAudioRenderer /> : null}

      <div className="border-t border-border pt-3">
        <p className="mb-2 text-xs font-medium text-muted">{t("voice.inVoice")}</p>
        <VoiceParticipantList participants={voiceParticipants} />
      </div>
    </div>
  );
}

export function LiveKitVoiceRoom({
  token,
  livekitUrl,
  startMicMuted = false,
  onConnected,
  onDisconnected,
  onError,
}: LiveKitVoiceRoomProps) {
  const { t } = useLanguage();

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect
      audio={false}
      video={false}
      onDisconnected={onDisconnected}
      onError={(error) => {
        if (error.message.toLowerCase().includes("permission")) {
          onError(t("voice.micPermissionDenied"));
          return;
        }

        onError(t("voice.connectFailed"));
      }}
      onMediaDeviceFailure={(failure) => {
        if (failure === MediaDeviceFailure.PermissionDenied) {
          onError(t("voice.micPermissionDenied"));
          return;
        }

        onError(t("voice.connectFailed"));
      }}
      className="contents"
    >
      <VoiceRoomContent
        startMicMuted={startMicMuted}
        onConnected={onConnected}
        onDisconnected={onDisconnected}
        onError={onError}
      />
    </LiveKitRoom>
  );
}
