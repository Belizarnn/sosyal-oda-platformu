"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

interface WatchTimerProps {
  currentTime: number;
  isPlaying: boolean;
  isHost: boolean;
  disabled?: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
}

function formatTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function WatchTimer({
  currentTime,
  isPlaying,
  isHost,
  disabled,
  onPlay,
  onPause,
  onReset,
}: WatchTimerProps) {
  const [displayTime, setDisplayTime] = useState(currentTime);
  const baseRef = useRef({ time: currentTime, at: Date.now(), playing: isPlaying });

  useEffect(() => {
    baseRef.current = { time: currentTime, at: Date.now(), playing: isPlaying };
    setDisplayTime(currentTime);
  }, [currentTime, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - baseRef.current.at) / 1000;
      setDisplayTime(baseRef.current.time + elapsed);
    }, 250);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="rounded-xl border border-border/60 bg-surface/40 p-4">
      <p className="text-xs uppercase tracking-wide text-muted">Ortak timer</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">{formatTime(displayTime)}</p>

      {isHost ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || isPlaying}
            onClick={onPlay}
          >
            Timer Başlat
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled || !isPlaying}
            onClick={onPause}
          >
            Durdur
          </Button>
          <Button variant="secondary" size="sm" disabled={disabled} onClick={onReset}>
            Sıfırla
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">
          Timer host tarafından kontrol edilir. Kendi platformunda play&apos;e bas.
        </p>
      )}
    </div>
  );
}
