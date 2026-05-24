"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadDevicePreferences,
  saveDevicePreferences,
} from "@/lib/devicePreferences";
import type {
  MediaDeviceOption,
  MediaPermissionState,
  VoiceDevicePreferences,
} from "@/types/voice";

function mapDevices(
  devices: MediaDeviceInfo[],
  kind: MediaDeviceInfo["kind"],
): MediaDeviceOption[] {
  return devices
    .filter((device) => device.kind === kind)
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label || `${kind}-${index + 1}`,
      kind: kind as MediaDeviceOption["kind"],
    }));
}

function readPermissionState(
  status: PermissionState | undefined,
): MediaPermissionState {
  if (status === "granted" || status === "denied" || status === "prompt") {
    return status;
  }

  return "unknown";
}

export function useMediaDevices() {
  const [availableMicrophones, setAvailableMicrophones] = useState<MediaDeviceOption[]>(
    [],
  );
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceOption[]>([]);
  const [availableSpeakers, setAvailableSpeakers] = useState<MediaDeviceOption[]>([]);
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState("");
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState("");
  const [microphonePermissionState, setMicrophonePermissionState] =
    useState<MediaPermissionState>("unknown");
  const [cameraPermissionState, setCameraPermissionState] =
    useState<MediaPermissionState>("unknown");
  const [supportsSpeakerSelection, setSupportsSpeakerSelection] = useState(false);
  const [micTestLevel, setMicTestLevel] = useState(0);
  const [isMicTestActive, setIsMicTestActive] = useState(false);
  const [isCameraPreviewActive, setIsCameraPreviewActive] = useState(false);
  const [mediaDeviceError, setMediaDeviceError] = useState<string | null>(null);

  const micTestStreamRef = useRef<MediaStream | null>(null);
  const micTestAnimationRef = useRef<number | null>(null);
  const micTestAnalyserRef = useRef<AnalyserNode | null>(null);
  const cameraPreviewStreamRef = useRef<MediaStream | null>(null);
  const cameraPreviewVideoRef = useRef<HTMLVideoElement | null>(null);

  const refreshPermissions = useCallback(async () => {
    if (typeof navigator.permissions?.query !== "function") {
      return;
    }

    try {
      const micPermission = await navigator.permissions.query({
        name: "microphone" as PermissionName,
      });
      setMicrophonePermissionState(readPermissionState(micPermission.state));
      micPermission.onchange = () => {
        setMicrophonePermissionState(readPermissionState(micPermission.state));
      };
    } catch {
      setMicrophonePermissionState("unknown");
    }

    try {
      const cameraPermission = await navigator.permissions.query({
        name: "camera" as PermissionName,
      });
      setCameraPermissionState(readPermissionState(cameraPermission.state));
      cameraPermission.onchange = () => {
        setCameraPermissionState(readPermissionState(cameraPermission.state));
      };
    } catch {
      setCameraPermissionState("unknown");
    }
  }, []);

  const refreshMediaDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setMediaDeviceError("unsupported");
      return;
    }

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAvailableMicrophones(mapDevices(devices, "audioinput"));
      setAvailableCameras(mapDevices(devices, "videoinput"));
      setAvailableSpeakers(mapDevices(devices, "audiooutput"));
      setSupportsSpeakerSelection(
        typeof HTMLMediaElement.prototype.setSinkId === "function",
      );
      setMediaDeviceError(null);
    } catch {
      setMediaDeviceError("enumerate-failed");
    }
  }, []);

  const loadPreferences = useCallback(() => {
    const preferences = loadDevicePreferences();
    setSelectedMicrophoneId(preferences.preferredMicrophoneId);
    setSelectedCameraId(preferences.preferredCameraId);
    setSelectedSpeakerId(preferences.preferredSpeakerId);
    return preferences;
  }, []);

  const persistPreferences = useCallback(
    (overrides?: Partial<VoiceDevicePreferences>) => {
      const preferences: VoiceDevicePreferences = {
        preferredMicrophoneId: overrides?.preferredMicrophoneId ?? selectedMicrophoneId,
        preferredCameraId: overrides?.preferredCameraId ?? selectedCameraId,
        preferredSpeakerId: overrides?.preferredSpeakerId ?? selectedSpeakerId,
      };
      saveDevicePreferences(preferences);
      return preferences;
    },
    [selectedCameraId, selectedMicrophoneId, selectedSpeakerId],
  );

  const stopMicrophoneTest = useCallback(() => {
    if (micTestAnimationRef.current !== null) {
      cancelAnimationFrame(micTestAnimationRef.current);
      micTestAnimationRef.current = null;
    }

    micTestStreamRef.current?.getTracks().forEach((track) => track.stop());
    micTestStreamRef.current = null;
    micTestAnalyserRef.current = null;
    setIsMicTestActive(false);
    setMicTestLevel(0);
  }, []);

  const stopCameraPreview = useCallback(() => {
    cameraPreviewStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraPreviewStreamRef.current = null;

    if (cameraPreviewVideoRef.current) {
      cameraPreviewVideoRef.current.srcObject = null;
    }

    setIsCameraPreviewActive(false);
  }, []);

  const startMicrophoneTest = useCallback(async () => {
    stopMicrophoneTest();
    setMediaDeviceError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: selectedMicrophoneId
          ? { deviceId: { exact: selectedMicrophoneId } }
          : true,
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      micTestStreamRef.current = stream;
      micTestAnalyserRef.current = analyser;
      setIsMicTestActive(true);

      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        if (!micTestAnalyserRef.current) {
          return;
        }

        micTestAnalyserRef.current.getByteFrequencyData(data);
        const average = data.reduce((sum, value) => sum + value, 0) / data.length;
        setMicTestLevel(Math.min(100, Math.round((average / 255) * 100)));
        micTestAnimationRef.current = requestAnimationFrame(tick);
      };

      micTestAnimationRef.current = requestAnimationFrame(tick);
      await refreshMediaDevices();
    } catch {
      setMediaDeviceError("mic-permission");
      stopMicrophoneTest();
    }
  }, [refreshMediaDevices, selectedMicrophoneId, stopMicrophoneTest]);

  const startCameraPreview = useCallback(
    async (videoElement?: HTMLVideoElement | null) => {
      stopCameraPreview();
      setMediaDeviceError(null);

      if (videoElement) {
        cameraPreviewVideoRef.current = videoElement;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedCameraId
            ? { deviceId: { exact: selectedCameraId } }
            : true,
        });

        cameraPreviewStreamRef.current = stream;

        if (cameraPreviewVideoRef.current) {
          cameraPreviewVideoRef.current.srcObject = stream;
          await cameraPreviewVideoRef.current.play();
        }

        setIsCameraPreviewActive(true);
        await refreshMediaDevices();
      } catch {
        setMediaDeviceError("camera-permission");
        stopCameraPreview();
      }
    },
    [refreshMediaDevices, selectedCameraId, stopCameraPreview],
  );

  useEffect(() => {
    loadPreferences();
    void refreshPermissions();
    void refreshMediaDevices();

    return () => {
      stopMicrophoneTest();
      stopCameraPreview();
    };
  }, [
    loadPreferences,
    refreshMediaDevices,
    refreshPermissions,
    stopCameraPreview,
    stopMicrophoneTest,
  ]);

  return {
    availableMicrophones,
    availableCameras,
    availableSpeakers,
    selectedMicrophoneId,
    selectedCameraId,
    selectedSpeakerId,
    setSelectedMicrophoneId,
    setSelectedCameraId,
    setSelectedSpeakerId,
    microphonePermissionState,
    cameraPermissionState,
    supportsSpeakerSelection,
    mediaDeviceError,
    setMediaDeviceError,
    micTestLevel,
    isMicTestActive,
    isCameraPreviewActive,
    cameraPreviewVideoRef,
    refreshMediaDevices,
    loadPreferences,
    persistPreferences,
    startMicrophoneTest,
    stopMicrophoneTest,
    startCameraPreview,
    stopCameraPreview,
  };
}
