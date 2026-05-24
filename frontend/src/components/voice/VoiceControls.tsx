"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface VoiceControlsProps {
  isConnected: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isCameraEnabled?: boolean;
  disabled?: boolean;
  onToggleMute: () => void;
  onToggleCamera?: () => void;
  onToggleDeafen: () => void;
  onDisconnect: () => void;
  disconnectLabel?: string;
  showCamera?: boolean;
  compact?: boolean;
}

function MicIcon({ muted, className = "h-5 w-5" }: { muted: boolean; className?: string }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <line x1="12" x2="12" y1="19" y2="22" />
        <line x1="8" x2="16" y1="22" y2="22" />
        <line x1="4" x2="20" y1="4" y2="20" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" x2="12" y1="19" y2="22" />
      <line x1="8" x2="16" y1="22" y2="22" />
    </svg>
  );
}

function HeadphoneIcon({ deafened, className = "h-5 w-5" }: { deafened: boolean; className?: string }) {
  if (deafened) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
        <path d="M3 14a2 2 0 0 0 2 2h1v-5H5a2 2 0 0 0-2 2Z" />
        <path d="M21 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" />
        <line x1="4" x2="20" y1="4" y2="20" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 14v-3a9 9 0 0 1 18 0v3" />
      <path d="M3 14a2 2 0 0 0 2 2h1v-5H5a2 2 0 0 0-2 2Z" />
      <path d="M21 14a2 2 0 0 1-2 2h-1v-5h1a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

function CameraIcon({ disabled, className = "h-5 w-5" }: { disabled: boolean; className?: string }) {
  if (disabled) {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
        <line x1="2" x2="22" y1="2" y2="22" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function DisconnectIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.7 13.3a1 1 0 0 0-1.4 1.4l2.3 2.3a1 1 0 0 0 1.4 0l2.3-2.3a1 1 0 0 0-1.4-1.4" />
      <path d="M12 2v7" />
      <path d="M5.5 8.5A7 7 0 0 0 19 12" />
      <path d="M2 12a10 10 0 0 1 18.4-5.6" />
    </svg>
  );
}

function ControlButton({
  active,
  danger,
  label,
  onClick,
  disabled,
  compact,
  children,
}: {
  active?: boolean;
  danger?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg border transition",
        compact ? "h-9 w-9" : "h-12 w-12 sm:h-11 sm:w-11",
        danger
          ? "border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20"
          : active
            ? "border-accent/40 bg-accent/20 text-accent-foreground"
            : "border-border bg-surface text-foreground hover:border-border hover:bg-surface",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </button>
  );
}

export function VoiceControls({
  isConnected,
  isMuted,
  isDeafened,
  isCameraEnabled = false,
  disabled = false,
  onToggleMute,
  onToggleCamera,
  onToggleDeafen,
  onDisconnect,
  disconnectLabel,
  showCamera = true,
  compact = false,
}: VoiceControlsProps) {
  const { t } = useLanguage();

  if (!isConnected) {
    return null;
  }

  const iconClass = compact ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", !compact && "justify-center gap-2 pt-2")}>
      <ControlButton
        label={isMuted ? t("voice.unmuteMic") : t("voice.muteMic")}
        active={isMuted}
        onClick={onToggleMute}
        disabled={disabled}
        compact={compact}
      >
        <MicIcon muted={isMuted} className={iconClass} />
      </ControlButton>

      {showCamera && onToggleCamera ? (
        <ControlButton
          label={isCameraEnabled ? t("voice.disableCamera") : t("voice.enableCamera")}
          active={!isCameraEnabled}
          onClick={onToggleCamera}
          disabled={disabled}
          compact={compact}
        >
          <CameraIcon disabled={!isCameraEnabled} className={iconClass} />
        </ControlButton>
      ) : null}

      <ControlButton
        label={isDeafened ? t("voice.undeafen") : t("voice.deafen")}
        active={isDeafened}
        onClick={onToggleDeafen}
        disabled={disabled}
        compact={compact}
      >
        <HeadphoneIcon deafened={isDeafened} className={iconClass} />
      </ControlButton>

      <ControlButton
        label={disconnectLabel ?? t("voice.leaveVoice")}
        danger
        onClick={onDisconnect}
        disabled={disabled}
        compact={compact}
      >
        <DisconnectIcon className={iconClass} />
      </ControlButton>
    </div>
  );
}
