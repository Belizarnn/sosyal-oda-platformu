"use client";

import { ConnectionState } from "livekit-client";
import { useConnectionState } from "@livekit/components-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface VoiceConnectionStatusProps {
  className?: string;
}

export function VoiceConnectionStatus({ className }: VoiceConnectionStatusProps) {
  const { t } = useLanguage();
  const connectionState = useConnectionState();

  const label = (() => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return t("voice.status.connected");
      case ConnectionState.Connecting:
        return t("voice.status.connecting");
      case ConnectionState.Reconnecting:
        return t("voice.status.reconnecting");
      case ConnectionState.Disconnected:
      default:
        return t("voice.status.disconnected");
    }
  })();

  const tone = (() => {
    switch (connectionState) {
      case ConnectionState.Connected:
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
      case ConnectionState.Connecting:
      case ConnectionState.Reconnecting:
        return "border-amber-500/30 bg-amber-500/10 text-amber-100";
      default:
        return "border-border bg-surface text-muted";
    }
  })();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs",
        tone,
        className,
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          connectionState === ConnectionState.Connected
            ? "bg-emerald-400"
            : connectionState === ConnectionState.Connecting ||
                connectionState === ConnectionState.Reconnecting
              ? "animate-pulse bg-amber-400"
              : "bg-muted",
        )}
        aria-hidden
      />
      {label}
    </div>
  );
}
