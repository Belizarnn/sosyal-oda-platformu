"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface LoadingStateProps {
  label?: string;
  className?: string;
  rows?: number;
}

export function LoadingState({
  label,
  className,
  rows = 3,
}: LoadingStateProps) {
  const { t } = useLanguage();
  const resolvedLabel = label ?? t("common.loading");

  return (
    <div className={cn("space-y-4", className)} role="status" aria-live="polite">
      <p className="text-sm text-muted">{resolvedLabel}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-2xl border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}

export function LoadingSpinner({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  const { t } = useLanguage();
  const resolvedLabel = label ?? t("common.loading");

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
      <p className="text-sm text-muted">{resolvedLabel}</p>
    </div>
  );
}
