"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { MediaDeviceFailure } from "livekit-client";
import { GlobalVoiceBar } from "@/components/voice/GlobalVoiceBar";
import { VoiceReconnectBanner } from "@/components/voice/VoiceReconnectBanner";
import {
  VoiceRoomBridge,
  type VoiceRoomControls,
} from "@/components/voice/VoiceRoomBridge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMediaDevices } from "@/hooks/useMediaDevices";
import { ApiError, requestVoiceToken } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  clearLastVoiceRoom,
  persistLastVoiceRoom,
  readLastVoiceRoom,
} from "@/lib/voiceStorage";
import type { VoiceParticipant } from "@/types/voice";

interface VoiceSession {
  token: string;
  livekitUrl: string;
  roomId: string;
  roomDisplayName: string;
}

interface JoinVoiceOptions {
  startMicMuted?: boolean;
  forceSwitch?: boolean;
}

interface VoiceContextValue {
  isVoiceConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  currentVoiceRoomId: string | null;
  currentVoiceRoomName: string | null;
  participants: VoiceParticipant[];
  activeSpeakers: string[];
  isMuted: boolean;
  isDeafened: boolean;
  isCameraEnabled: boolean;
  availableMicrophones: ReturnType<typeof useMediaDevices>["availableMicrophones"];
  availableCameras: ReturnType<typeof useMediaDevices>["availableCameras"];
  availableSpeakers: ReturnType<typeof useMediaDevices>["availableSpeakers"];
  selectedMicrophoneId: string;
  selectedCameraId: string;
  selectedSpeakerId: string;
  supportsSpeakerSelection: boolean;
  microphonePermissionState: ReturnType<typeof useMediaDevices>["microphonePermissionState"];
  cameraPermissionState: ReturnType<typeof useMediaDevices>["cameraPermissionState"];
  mediaDeviceError: string | null;
  micTestLevel: number;
  isMicTestActive: boolean;
  isCameraPreviewActive: boolean;
  reconnectPrompt: { roomId: string; roomName: string } | null;
  joinVoiceRoom: (
    roomId: string,
    roomDisplayName: string,
    options?: JoinVoiceOptions,
  ) => Promise<void>;
  leaveVoiceRoom: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  toggleDeafen: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  enableCamera: () => Promise<void>;
  disableCamera: () => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  switchSpeaker: (deviceId: string) => Promise<void>;
  loadMediaDevices: () => Promise<void>;
  refreshMediaDevices: () => Promise<void>;
  saveDevicePreferences: () => void;
  startMicrophoneTest: () => Promise<void>;
  stopMicrophoneTest: () => void;
  startCameraPreview: (videoElement?: HTMLVideoElement | null) => Promise<void>;
  stopCameraPreview: () => void;
  getParticipantSpeakingState: (participantId: string) => boolean;
  dismissReconnectPrompt: () => void;
  reconnectToLastRoom: () => Promise<void>;
  clearConnectionError: () => void;
}

const VoiceContext = createContext<VoiceContextValue | null>(null);

export function VoiceProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const mediaDevices = useMediaDevices();
  const [session, setSession] = useState<VoiceSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [activeSpeakers, setActiveSpeakers] = useState<string[]>([]);
  const [reconnectPrompt, setReconnectPrompt] = useState<{
    roomId: string;
    roomName: string;
  } | null>(null);

  const userInitiatedLeaveRef = useRef(false);
  const roomControlsRef = useRef<VoiceRoomControls | null>(null);
  const startMicMutedRef = useRef(false);
  const reconnectPromptLoadedRef = useRef(false);

  const resetVoiceState = useCallback(() => {
    setSession(null);
    setIsConnecting(false);
    setParticipants([]);
    setActiveSpeakers([]);
    setIsMuted(false);
    setIsDeafened(false);
    setIsCameraEnabled(false);
  }, []);

  const leaveVoiceRoom = useCallback(async () => {
    userInitiatedLeaveRef.current = true;
    roomControlsRef.current?.disconnect();
    clearLastVoiceRoom();
    resetVoiceState();
    setConnectionError(null);
  }, [resetVoiceState]);

  const joinVoiceRoom = useCallback(
    async (roomId: string, roomDisplayName: string, options?: JoinVoiceOptions) => {
      if (!getToken()) {
        throw new Error(t("voice.loginRequired"));
      }

      if (session?.roomId === roomId) {
        return;
      }

      if (session && session.roomId !== roomId) {
        if (!options?.forceSwitch) {
          throw new Error(t("voice.otherRoomConnected"));
        }

        userInitiatedLeaveRef.current = true;
        roomControlsRef.current?.disconnect();
        resetVoiceState();
      }

      setConnectionError(null);
      setIsConnecting(true);
      startMicMutedRef.current = options?.startMicMuted ?? false;

      try {
        const tokenResponse = await requestVoiceToken(roomId);
        persistLastVoiceRoom(roomId, roomDisplayName);
        setReconnectPrompt(null);
        setSession({
          token: tokenResponse.token,
          livekitUrl: tokenResponse.livekitUrl,
          roomId,
          roomDisplayName,
        });
      } catch (err) {
        setIsConnecting(false);
        const message =
          err instanceof ApiError ? err.message : t("voice.connectionFailed");
        setConnectionError(message);
        throw err;
      }
    },
    [resetVoiceState, session, t],
  );

  const toggleMicrophone = useCallback(async () => {
    try {
      await roomControlsRef.current?.toggleMicrophone();
    } catch {
      setConnectionError(t("voice.micPermissionDenied"));
    }
  }, [t]);

  const toggleDeafen = useCallback(async () => {
    try {
      await roomControlsRef.current?.toggleDeafen();
    } catch {
      setConnectionError(t("voice.micPermissionDenied"));
    }
  }, [t]);

  const toggleCamera = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      await roomControlsRef.current?.toggleCamera();
      setConnectionError(null);
    } catch {
      setConnectionError(t("voice.cameraPermissionDenied"));
    }
  }, [session, t]);

  const enableCamera = useCallback(async () => {
    if (!session) {
      return;
    }

    try {
      await roomControlsRef.current?.enableCamera(mediaDevices.selectedCameraId);
      setConnectionError(null);
    } catch {
      setConnectionError(t("voice.cameraPermissionDenied"));
    }
  }, [mediaDevices.selectedCameraId, session, t]);

  const disableCamera = useCallback(async () => {
    await roomControlsRef.current?.disableCamera();
  }, []);

  const switchMicrophone = useCallback(
    async (deviceId: string) => {
      mediaDevices.setSelectedMicrophoneId(deviceId);
      mediaDevices.persistPreferences({ preferredMicrophoneId: deviceId });

      if (session) {
        await roomControlsRef.current?.switchMicrophone(deviceId);
      }
    },
    [mediaDevices, session],
  );

  const switchCamera = useCallback(
    async (deviceId: string) => {
      mediaDevices.setSelectedCameraId(deviceId);
      mediaDevices.persistPreferences({ preferredCameraId: deviceId });

      if (session) {
        await roomControlsRef.current?.switchCamera(deviceId);
      }
    },
    [mediaDevices, session],
  );

  const switchSpeaker = useCallback(
    async (deviceId: string) => {
      mediaDevices.setSelectedSpeakerId(deviceId);
      mediaDevices.persistPreferences({ preferredSpeakerId: deviceId });

      if (session) {
        await roomControlsRef.current?.switchSpeaker(deviceId);
      }
    },
    [mediaDevices, session],
  );

  const saveDevicePreferences = useCallback(() => {
    mediaDevices.persistPreferences();
  }, [mediaDevices]);

  const getParticipantSpeakingState = useCallback(
    (participantId: string) => activeSpeakers.includes(participantId),
    [activeSpeakers],
  );

  const dismissReconnectPrompt = useCallback(() => {
    clearLastVoiceRoom();
    setReconnectPrompt(null);
  }, []);

  const reconnectToLastRoom = useCallback(async () => {
    if (!reconnectPrompt) {
      return;
    }

    await joinVoiceRoom(reconnectPrompt.roomId, reconnectPrompt.roomName);
  }, [joinVoiceRoom, reconnectPrompt]);

  const clearConnectionError = useCallback(() => {
    setConnectionError(null);
  }, []);

  const handleLiveKitDisconnected = useCallback(() => {
    if (!userInitiatedLeaveRef.current) {
      setConnectionError(t("voice.unexpectedDisconnect"));
    }

    userInitiatedLeaveRef.current = false;
    resetVoiceState();
  }, [resetVoiceState, t]);

  const handleLiveKitError = useCallback(
    (error: Error) => {
      if (error.message.toLowerCase().includes("permission")) {
        setConnectionError(t("voice.micPermissionDenied"));
        return;
      }

      setConnectionError(t("voice.connectFailed"));
      userInitiatedLeaveRef.current = true;
      resetVoiceState();
    },
    [resetVoiceState, t],
  );

  useEffect(() => {
    if (session || reconnectPromptLoadedRef.current) {
      return;
    }

    reconnectPromptLoadedRef.current = true;
    const lastRoom = readLastVoiceRoom();

    if (lastRoom) {
      setReconnectPrompt(lastRoom);
    }
  }, [session]);

  const preferredDevices = useMemo(
    () => ({
      preferredMicrophoneId: mediaDevices.selectedMicrophoneId,
      preferredCameraId: mediaDevices.selectedCameraId,
      preferredSpeakerId: mediaDevices.selectedSpeakerId,
    }),
    [
      mediaDevices.selectedCameraId,
      mediaDevices.selectedMicrophoneId,
      mediaDevices.selectedSpeakerId,
    ],
  );

  const value = useMemo<VoiceContextValue>(
    () => ({
      isVoiceConnected: Boolean(session),
      isConnecting,
      connectionError,
      currentVoiceRoomId: session?.roomId ?? null,
      currentVoiceRoomName: session?.roomDisplayName ?? null,
      participants,
      activeSpeakers,
      isMuted,
      isDeafened,
      isCameraEnabled,
      availableMicrophones: mediaDevices.availableMicrophones,
      availableCameras: mediaDevices.availableCameras,
      availableSpeakers: mediaDevices.availableSpeakers,
      selectedMicrophoneId: mediaDevices.selectedMicrophoneId,
      selectedCameraId: mediaDevices.selectedCameraId,
      selectedSpeakerId: mediaDevices.selectedSpeakerId,
      supportsSpeakerSelection: mediaDevices.supportsSpeakerSelection,
      microphonePermissionState: mediaDevices.microphonePermissionState,
      cameraPermissionState: mediaDevices.cameraPermissionState,
      mediaDeviceError: mediaDevices.mediaDeviceError,
      micTestLevel: mediaDevices.micTestLevel,
      isMicTestActive: mediaDevices.isMicTestActive,
      isCameraPreviewActive: mediaDevices.isCameraPreviewActive,
      reconnectPrompt: session ? null : reconnectPrompt,
      joinVoiceRoom,
      leaveVoiceRoom,
      toggleMicrophone,
      toggleDeafen,
      toggleCamera,
      enableCamera,
      disableCamera,
      switchMicrophone,
      switchCamera,
      switchSpeaker,
      loadMediaDevices: mediaDevices.refreshMediaDevices,
      refreshMediaDevices: mediaDevices.refreshMediaDevices,
      saveDevicePreferences,
      startMicrophoneTest: mediaDevices.startMicrophoneTest,
      stopMicrophoneTest: mediaDevices.stopMicrophoneTest,
      startCameraPreview: mediaDevices.startCameraPreview,
      stopCameraPreview: mediaDevices.stopCameraPreview,
      getParticipantSpeakingState,
      dismissReconnectPrompt,
      reconnectToLastRoom,
      clearConnectionError,
    }),
    [
      session,
      isConnecting,
      connectionError,
      participants,
      activeSpeakers,
      isMuted,
      isDeafened,
      isCameraEnabled,
      mediaDevices,
      reconnectPrompt,
      joinVoiceRoom,
      leaveVoiceRoom,
      toggleMicrophone,
      toggleDeafen,
      toggleCamera,
      enableCamera,
      disableCamera,
      switchMicrophone,
      switchCamera,
      switchSpeaker,
      saveDevicePreferences,
      getParticipantSpeakingState,
      dismissReconnectPrompt,
      reconnectToLastRoom,
      clearConnectionError,
    ],
  );

  return (
    <VoiceContext.Provider value={value}>
      {session ? (
        <LiveKitRoom
          token={session.token}
          serverUrl={session.livekitUrl}
          connect
          audio={false}
          video={false}
          onConnected={() => {
            setIsConnecting(false);
            setConnectionError(null);
          }}
          onDisconnected={handleLiveKitDisconnected}
          onError={handleLiveKitError}
          onMediaDeviceFailure={(failure) => {
            if (failure === MediaDeviceFailure.PermissionDenied) {
              setConnectionError(t("voice.micPermissionDenied"));
              return;
            }

            if (failure === MediaDeviceFailure.DeviceInUse) {
              setConnectionError(t("voice.deviceInUse"));
              return;
            }

            setConnectionError(t("voice.connectFailed"));
          }}
          className="contents"
        >
          <VoiceRoomBridge
            startMicMuted={startMicMutedRef.current}
            preferredDevices={preferredDevices}
            roomControlsRef={roomControlsRef}
            onParticipantsChange={setParticipants}
            onActiveSpeakersChange={setActiveSpeakers}
            onMutedChange={setIsMuted}
            onDeafenedChange={setIsDeafened}
            onCameraEnabledChange={setIsCameraEnabled}
            onMicReady={() => {
              setIsConnecting(false);
              setConnectionError(null);
            }}
            onMicError={setConnectionError}
            onCameraError={setConnectionError}
          />
          {!isDeafened ? <RoomAudioRenderer /> : null}
          {children}
          <GlobalVoiceBar />
        </LiveKitRoom>
      ) : (
        <>
          {children}
          {reconnectPrompt ? (
            <VoiceReconnectBanner
              roomName={reconnectPrompt.roomName}
              onReconnect={() => void reconnectToLastRoom()}
              onDismiss={dismissReconnectPrompt}
              loading={isConnecting}
            />
          ) : null}
        </>
      )}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);

  if (!context) {
    throw new Error("useVoice VoiceProvider içinde kullanılmalıdır.");
  }

  return context;
}

export function useVoiceOptional() {
  return useContext(VoiceContext);
}
