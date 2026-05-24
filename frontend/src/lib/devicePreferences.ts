import type { VoiceDevicePreferences } from "@/types/voice";

const STORAGE_KEY = "sosyal-oda:voice-device-preferences";

const DEFAULT_PREFERENCES: VoiceDevicePreferences = {
  preferredMicrophoneId: "",
  preferredCameraId: "",
  preferredSpeakerId: "",
};

export function loadDevicePreferences(): VoiceDevicePreferences {
  if (typeof window === "undefined") {
    return DEFAULT_PREFERENCES;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<VoiceDevicePreferences>;
    return {
      preferredMicrophoneId: parsed.preferredMicrophoneId ?? "",
      preferredCameraId: parsed.preferredCameraId ?? "",
      preferredSpeakerId: parsed.preferredSpeakerId ?? "",
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveDevicePreferences(preferences: VoiceDevicePreferences): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
