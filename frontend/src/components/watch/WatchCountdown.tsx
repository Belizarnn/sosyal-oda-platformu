"use client";

import { useEffect, useState } from "react";

interface WatchCountdownProps {
  countdownEndsAt: string | null;
  onComplete?: () => void;
}

export function WatchCountdown({ countdownEndsAt, onComplete }: WatchCountdownProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!countdownEndsAt) {
      setRemaining(null);
      return;
    }

    function tick() {
      const diff = Math.ceil((new Date(countdownEndsAt!).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setRemaining(null);
        onComplete?.();
        return;
      }
      setRemaining(diff);
    }

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [countdownEndsAt, onComplete]);

  if (remaining === null) {
    return null;
  }

  return (
    <div className="flex items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 px-6 py-10">
      <span className="text-5xl font-bold tabular-nums text-accent-foreground">{remaining}</span>
    </div>
  );
}
