"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useLocalParticipant,
  useParticipants,
  useRoomContext,
  useSpeakingParticipants,
} from "@livekit/components-react";
import type { Participant } from "livekit-client";
import { useLanguage } from "@/contexts/LanguageContext";
import type { VoiceDevicePreferences } from "@/types/voice";
import type { VoiceParticipant } from "@/types/voice";

export interface VoiceRoomControls {
  disconnect: () => void;
  toggleMicrophone: () => Promise<void>;
  toggleDeafen: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  enableCamera: (deviceId?: string) => Promise<void>;
  disableCamera: () => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  switchSpeaker: (deviceId: string) => Promise<void>;
}

interface VoiceRoomBridgeProps {
  startMicMuted: boolean;
  preferredDevices: VoiceDevicePreferences;
  roomControlsRef: React.MutableRefObject<VoiceRoomControls | null>;
  onParticipantsChange: (participants: VoiceParticipant[]) => void;
  onActiveSpeakersChange: (speakerIds: string[]) => void;
  onMutedChange: (isMuted: boolean) => void;
  onDeafenedChange: (isDeafened: boolean) => void;
  onCameraEnabledChange: (isCameraEnabled: boolean) => void;
  onMicReady: () => void;
  onMicError: (message: string) => void;
  onCameraError: (message: string) => void;
}

function mapParticipant(
  participant: Participant,
  speakingIds: Set<string>,
  localDeafened: boolean,
  localIdentity: string,
): VoiceParticipant {
  const isLocal = participant.identity === localIdentity;

  return {
    id: participant.identity,
    username: participant.name || participant.identity,
    handle: participant.name || participant.identity,
    isMuted: !participant.isMicrophoneEnabled,
    isDeafened: isLocal ? localDeafened : false,
    isSpeaking: speakingIds.has(participant.identity),
    isCameraEnabled: participant.isCameraEnabled,
  };
}

export function VoiceRoomBridge({
  startMicMuted,
  preferredDevices,
  roomControlsRef,
  onParticipantsChange,
  onActiveSpeakersChange,
  onMutedChange,
  onDeafenedChange,
  onCameraEnabledChange,
  onMicReady,
  onMicError,
  onCameraError,
}: VoiceRoomBridgeProps) {
  const { t } = useLanguage();
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participants = useParticipants();
  const speakingParticipants = useSpeakingParticipants();
  const [isMuted, setIsMuted] = useState(startMicMuted);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [micInitialized, setMicInitialized] = useState(false);
  const micInitRef = useRef(false);
  const preferredDevicesRef = useRef(preferredDevices);

  preferredDevicesRef.current = preferredDevices;

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
        localParticipant.identity,
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
    onParticipantsChange(voiceParticipants);
    onActiveSpeakersChange(
      voiceParticipants.filter((participant) => participant.isSpeaking).map((p) => p.id),
    );
  }, [voiceParticipants, onParticipantsChange, onActiveSpeakersChange]);

  useEffect(() => {
    onMutedChange(isMuted);
  }, [isMuted, onMutedChange]);

  useEffect(() => {
    onDeafenedChange(isDeafened);
  }, [isDeafened, onDeafenedChange]);

  useEffect(() => {
    onCameraEnabledChange(isCameraEnabled);
  }, [isCameraEnabled, onCameraEnabledChange]);

  useEffect(() => {
    if (micInitRef.current || !localParticipant) {
      return;
    }

    micInitRef.current = true;

    async function initializeMedia() {
      try {
        const micId = preferredDevicesRef.current.preferredMicrophoneId;
        const speakerId = preferredDevicesRef.current.preferredSpeakerId;

        if (micId) {
          await room.switchActiveDevice("audioinput", micId).catch(() => undefined);
        }

        if (speakerId) {
          await room.switchActiveDevice("audiooutput", speakerId).catch(() => undefined);
        }

        await localParticipant.setMicrophoneEnabled(!startMicMuted);
        setIsMuted(startMicMuted);
        setMicInitialized(true);
        onMicReady();
      } catch {
        setIsMuted(true);
        setMicInitialized(true);
        onMicError(t("voice.micPermissionDenied"));
      }
    }

    void initializeMedia();
  }, [localParticipant, onMicError, onMicReady, room, startMicMuted, t]);

  const handleToggleMute = useCallback(async () => {
    try {
      const nextMuted = !isMuted;
      await localParticipant.setMicrophoneEnabled(!nextMuted);
      setIsMuted(nextMuted);
    } catch {
      throw new Error("mic-permission");
    }
  }, [isMuted, localParticipant]);

  const handleToggleDeafen = useCallback(async () => {
    const nextDeafened = !isDeafened;
    setIsDeafened(nextDeafened);

    if (nextDeafened && !isMuted) {
      try {
        await localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      } catch {
        throw new Error("mic-permission");
      }
    }
  }, [isDeafened, isMuted, localParticipant]);

  const handleEnableCamera = useCallback(
    async (deviceId?: string) => {
      try {
        const cameraId =
          deviceId || preferredDevicesRef.current.preferredCameraId || undefined;

        if (cameraId) {
          await room.switchActiveDevice("videoinput", cameraId).catch(() => undefined);
        }

        await localParticipant.setCameraEnabled(true);
        setIsCameraEnabled(true);
      } catch {
        setIsCameraEnabled(false);
        onCameraError(t("voice.cameraPermissionDenied"));
        throw new Error("camera-permission");
      }
    },
    [localParticipant, onCameraError, room, t],
  );

  const handleDisableCamera = useCallback(async () => {
    await localParticipant.setCameraEnabled(false);
    setIsCameraEnabled(false);
  }, [localParticipant]);

  const handleToggleCamera = useCallback(async () => {
    if (isCameraEnabled) {
      await handleDisableCamera();
      return;
    }

    await handleEnableCamera();
  }, [handleDisableCamera, handleEnableCamera, isCameraEnabled]);

  const handleSwitchMicrophone = useCallback(
    async (deviceId: string) => {
      await room.switchActiveDevice("audioinput", deviceId);
      if (!isMuted) {
        await localParticipant.setMicrophoneEnabled(true);
      }
    },
    [isMuted, localParticipant, room],
  );

  const handleSwitchCamera = useCallback(
    async (deviceId: string) => {
      await room.switchActiveDevice("videoinput", deviceId);
      if (isCameraEnabled) {
        await localParticipant.setCameraEnabled(true);
      }
    },
    [isCameraEnabled, localParticipant, room],
  );

  const handleSwitchSpeaker = useCallback(
    async (deviceId: string) => {
      await room.switchActiveDevice("audiooutput", deviceId);
    },
    [room],
  );

  useEffect(() => {
    roomControlsRef.current = {
      disconnect: () => {
        void room.disconnect();
      },
      toggleMicrophone: handleToggleMute,
      toggleDeafen: handleToggleDeafen,
      toggleCamera: handleToggleCamera,
      enableCamera: handleEnableCamera,
      disableCamera: handleDisableCamera,
      switchMicrophone: handleSwitchMicrophone,
      switchCamera: handleSwitchCamera,
      switchSpeaker: handleSwitchSpeaker,
    };

    return () => {
      roomControlsRef.current = null;
    };
  }, [
    room,
    roomControlsRef,
    handleToggleMute,
    handleToggleDeafen,
    handleToggleCamera,
    handleEnableCamera,
    handleDisableCamera,
    handleSwitchMicrophone,
    handleSwitchCamera,
    handleSwitchSpeaker,
  ]);

  if (!micInitialized) {
    return null;
  }

  return null;
}
