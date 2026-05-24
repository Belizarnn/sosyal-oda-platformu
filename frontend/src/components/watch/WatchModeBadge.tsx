"use client";

import type { MediaMode, MediaProvider } from "@/types/watch";
import { getProviderLabel } from "@/types/watch";

interface WatchModeBadgeProps {
  provider: MediaProvider;
  mode: MediaMode;
}

export function WatchModeBadge({ provider, mode }: WatchModeBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        {getProviderLabel(provider)}
      </span>
      <span
        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
          mode === "EMBED"
            ? "bg-emerald-500/15 text-emerald-200"
            : "bg-violet-500/15 text-violet-200"
        }`}
      >
        {mode === "EMBED" ? "Uygulama içi" : "Harici senkron"}
      </span>
    </div>
  );
}
