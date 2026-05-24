export interface VoiceParticipant {
  id: string;
  username: string;
  handle: string;
  avatarUrl?: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  isCameraEnabled: boolean;
  presenceStatus?: string;
}

export interface VoiceState {
  isConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isCameraEnabled: boolean;
}

export interface VoiceTokenResponse {
  provider: "livekit";
  roomId: string;
  roomName: string;
  identity: string;
  displayName: string;
  token: string;
  livekitUrl: string;
}

export interface MediaDeviceOption {
  deviceId: string;
  label: string;
  kind: "audioinput" | "videoinput" | "audiooutput";
}

export interface VoiceDevicePreferences {
  preferredMicrophoneId: string;
  preferredCameraId: string;
  preferredSpeakerId: string;
}

export type MediaPermissionState = "granted" | "denied" | "prompt" | "unknown";

export interface AudioVideoSettingsState {
  availableMicrophones: MediaDeviceOption[];
  availableCameras: MediaDeviceOption[];
  availableSpeakers: MediaDeviceOption[];
  selectedMicrophoneId: string;
  selectedCameraId: string;
  selectedSpeakerId: string;
  supportsSpeakerSelection: boolean;
  microphonePermissionState: MediaPermissionState;
  cameraPermissionState: MediaPermissionState;
}
