"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface VoiceReconnectBannerProps {
  roomName: string;
  onReconnect: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export function VoiceReconnectBanner({
  roomName,
  onReconnect,
  onDismiss,
  loading = false,
}: VoiceReconnectBannerProps) {
  const { t } = useLanguage();

  return (
    <div
      className={cn(
        "fixed z-40",
        "bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom,0px)+0.75rem)] left-3 right-3",
        "lg:bottom-4 lg:left-1/2 lg:w-[min(100%,32rem)] lg:-translate-x-1/2",
      )}
    >
      <div className="rounded-2xl border border-accent/20 bg-card/95 p-4 shadow-lg backdrop-blur-xl">
        <p className="text-sm font-medium text-foreground">{t("voice.reconnectPrompt")}</p>
        <p className="mt-1 text-xs text-muted">{roomName}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={onReconnect} disabled={loading}>
            {loading ? t("voice.joining") : t("voice.reconnectConfirm")}
          </Button>
          <Button size="sm" variant="secondary" onClick={onDismiss}>
            {t("voice.reconnectDismiss")}
          </Button>
        </div>
      </div>
    </div>
  );
}
