"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import {
  FEEDBACK_TYPE_OPTIONS,
  type FeedbackType,
} from "@/types/feedback";

interface FeedbackTypeSelectProps {
  value: FeedbackType;
  onChange: (value: FeedbackType) => void;
  className?: string;
}

export function FeedbackTypeSelect({
  value,
  onChange,
  className,
}: FeedbackTypeSelectProps) {
  const { t } = useLanguage();

  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {FEEDBACK_TYPE_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-sm transition",
              isActive
                ? "border-accent/50 bg-accent/10 text-foreground"
                : "border-border bg-surface text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
