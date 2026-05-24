"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LocalVideoPreview } from "@/components/voice/video/LocalVideoPreview";
import { useVoice } from "@/contexts/VoiceContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

function DeviceSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: { deviceId: string; label: string }[];
  onChange: (deviceId: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground/90">{label}</span>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-xl border border-border bg-input px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)]"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.deviceId} value={option.deviceId}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AudioVideoSettings() {
  const { t } = useLanguage();
  const {
    availableMicrophones,
    availableCameras,
    availableSpeakers,
    selectedMicrophoneId,
    selectedCameraId,
    selectedSpeakerId,
    supportsSpeakerSelection,
    mediaDeviceError,
    micTestLevel,
    isMicTestActive,
    isCameraPreviewActive,
    switchMicrophone,
    switchCamera,
    switchSpeaker,
    refreshMediaDevices,
    saveDevicePreferences,
    startMicrophoneTest,
    stopMicrophoneTest,
    startCameraPreview,
    stopCameraPreview,
  } = useVoice();

  const resolveDeviceError = useCallback(
    (error: string | null) => {
      switch (error) {
        case "mic-permission":
          return t("voice.settings.micPermissionRequired");
        case "camera-permission":
          return t("voice.cameraPermissionDenied");
        case "unsupported":
          return t("voice.settings.browserUnsupported");
        case "enumerate-failed":
          return t("voice.settings.deviceListFailed");
        default:
          return null;
      }
    },
    [t],
  );

  const errorMessage = resolveDeviceError(mediaDeviceError);

  return (
    <Card className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("voice.settings.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("voice.settings.subtitle")}</p>
      </div>

      {errorMessage ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <DeviceSelect
          label={t("voice.settings.microphone")}
          value={selectedMicrophoneId}
          options={availableMicrophones}
          onChange={(deviceId) => {
            void switchMicrophone(deviceId);
          }}
        />
        <DeviceSelect
          label={t("voice.settings.camera")}
          value={selectedCameraId}
          options={availableCameras}
          onChange={(deviceId) => {
            void switchCamera(deviceId);
          }}
        />
        <DeviceSelect
          label={t("voice.settings.speaker")}
          value={selectedSpeakerId}
          options={availableSpeakers}
          disabled={!supportsSpeakerSelection}
          onChange={(deviceId) => {
            void switchSpeaker(deviceId);
          }}
        />
      </div>

      {!supportsSpeakerSelection ? (
        <p className="text-xs text-muted">{t("voice.settings.speakerUnsupported")}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void refreshMediaDevices()}
        >
          {t("voice.settings.refreshDevices")}
        </Button>
        <Button size="sm" variant="secondary" onClick={saveDevicePreferences}>
          {t("voice.settings.savePreferences")}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">{t("voice.settings.micTest")}</h3>
          <p className="text-xs text-muted">{t("voice.settings.micTestHint")}</p>
          <div className="h-3 overflow-hidden rounded-full bg-surface">
            <div
              className={cn(
                "h-full rounded-full bg-violet-400 transition-all duration-150",
                isMicTestActive ? "opacity-100" : "opacity-30",
              )}
              style={{ width: `${Math.max(4, micTestLevel)}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => void startMicrophoneTest()}>
              {t("voice.settings.startMicTest")}
            </Button>
            <Button size="sm" variant="secondary" onClick={stopMicrophoneTest}>
              {t("voice.settings.stopMicTest")}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold">{t("voice.settings.cameraPreview")}</h3>
          <p className="text-xs text-muted">{t("voice.settings.cameraPreviewHint")}</p>
          <LocalVideoPreview
            active={isCameraPreviewActive}
            onStart={(videoElement) => void startCameraPreview(videoElement)}
            onStop={stopCameraPreview}
          />
        </div>
      </div>
    </Card>
  );
}
