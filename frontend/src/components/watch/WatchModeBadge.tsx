"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { MediaMode, MediaProvider } from "@/types/watch";
import { getProviderLabel } from "@/types/watch";

interface WatchModeBadgeProps {
  provider: MediaProvider;
  mode: MediaMode;
}

export function WatchModeBadge({ provider, mode }: WatchModeBadgeProps) {
  const { t } = useLanguage();

  const modeLabel =
    mode === "EMBED"
      ? t("watch.assisted.modeEmbed")
      : mode === "ASSISTED_EXTERNAL_SYNC"
        ? t("watch.assisted.modeAssisted")
        : t("watch.assisted.modeExternal");

  const modeClass =
    mode === "EMBED"
      ? "bg-emerald-500/15 text-emerald-200"
      : mode === "ASSISTED_EXTERNAL_SYNC"
        ? "bg-sky-500/15 text-sky-200"
        : "bg-violet-500/15 text-violet-200";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        {getProviderLabel(provider)}
      </span>
      <span
        className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${modeClass}`}
      >
        {modeLabel}
      </span>
    </div>
  );
}
