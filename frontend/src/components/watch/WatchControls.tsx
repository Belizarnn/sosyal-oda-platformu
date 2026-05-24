"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

interface WatchControlsProps {
  currentTime: number;
  isPlaying: boolean;
  isHost: boolean;
  disabled?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  onSync: () => void;
}

export function WatchControls({
  currentTime,
  isPlaying,
  isHost,
  disabled = false,
  onPlay,
  onPause,
  onSeek,
  onSync,
}: WatchControlsProps) {
  const { t } = useLanguage();
  const controlsDisabled = disabled || !isHost;
  const statusLabel = isPlaying ? t("watch.statusPlaying") : t("watch.statusPaused");

  return (
    <div className="space-y-3">
      {!isHost ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
          {t("watch.hostOnlyControls")}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={onPlay}
          disabled={controlsDisabled}
          className="flex-1 min-w-[88px]"
        >
          {t("watch.play")}
        </Button>
        <Button
          variant="secondary"
          onClick={onPause}
          disabled={controlsDisabled}
          className="flex-1 min-w-[88px]"
        >
          {t("watch.pause")}
        </Button>
        <Button
          variant="ghost"
          onClick={onSync}
          disabled={controlsDisabled}
          className="flex-1 min-w-[88px]"
        >
          {t("watch.sync")}
        </Button>
      </div>

      <label className="block space-y-1.5">
        <span className="text-xs text-muted">
          {t("watch.secondsLabel", { seconds: Math.floor(currentTime) })}
        </span>
        <input
          type="number"
          min={0}
          step={1}
          value={Math.floor(currentTime)}
          disabled={controlsDisabled}
          onChange={(event) => onSeek(Number(event.target.value))}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)] disabled:opacity-50"
        />
      </label>

      <p className="text-[11px] text-muted">
        {t("watch.statusLabel", { status: statusLabel })}
      </p>
    </div>
  );
}
