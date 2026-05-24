"use client";

import type { MediaProvider, WatchProviderOption } from "@/types/watch";
import { WATCH_PROVIDER_OPTIONS } from "@/types/watch";

interface WatchProviderSelectorProps {
  selected: MediaProvider | null;
  onSelect: (provider: MediaProvider) => void;
  disabled?: boolean;
}

function ProviderCard({
  option,
  selected,
  onSelect,
  disabled,
}: {
  option: WatchProviderOption;
  selected: boolean;
  onSelect: (provider: MediaProvider) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(option.provider)}
      className={`rounded-xl border px-3 py-3 text-left transition ${
        selected
          ? "border-accent bg-accent/10 shadow-[0_0_20px_var(--glow)]"
          : "border-border bg-surface/50 hover:border-accent/40"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <span className="inline-flex rounded-md border border-border/80 bg-surface px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
        {option.label}
      </span>
      <p className="mt-2 text-sm font-medium">{option.label}</p>
      <p className="mt-1 text-xs text-muted">{option.description}</p>
    </button>
  );
}

export function WatchProviderSelector({
  selected,
  onSelect,
  disabled,
}: WatchProviderSelectorProps) {
  const embedOptions = WATCH_PROVIDER_OPTIONS.filter((option) => option.group === "embed");
  const externalOptions = WATCH_PROVIDER_OPTIONS.filter(
    (option) => option.group === "external",
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Uygulama içinde izlenebilir
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {embedOptions.map((option) => (
            <ProviderCard
              key={option.provider}
              option={option}
              selected={selected === option.provider}
              onSelect={onSelect}
              disabled={disabled}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Harici senkron izleme
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {externalOptions.map((option) => (
            <ProviderCard
              key={option.provider}
              option={option}
              selected={selected === option.provider}
              onSelect={onSelect}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
