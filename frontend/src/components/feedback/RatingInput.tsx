"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface RatingInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  className?: string;
}

export function RatingInput({ value, onChange, className }: RatingInputProps) {
  const { t } = useLanguage();

  return (
    <div className={className}>
      <p className="mb-2 text-sm text-muted">{t("feedback.ratingLabel")}</p>
      <div className="flex flex-wrap items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => {
          const isActive = value === rating;

          return (
            <button
              key={rating}
              type="button"
              aria-label={t("feedback.ratingStar", { rating })}
              onClick={() => onChange(isActive ? null : rating)}
              className={cn(
                "inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-medium transition",
                isActive
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground",
              )}
            >
              {rating}
            </button>
          );
        })}
        {value ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-muted underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("feedback.ratingClear")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
