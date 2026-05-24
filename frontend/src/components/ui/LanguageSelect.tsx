"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/languages";
import { cn } from "@/lib/cn";

interface LanguageSelectProps {
  className?: string;
}

export function LanguageSelect({ className }: LanguageSelectProps) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <select
      value={locale}
      onChange={(event) => setLocale(event.target.value as typeof locale)}
      className={cn(
        "h-10 max-w-[7rem] rounded-xl border border-border bg-surface px-2 text-xs text-foreground outline-none transition hover:bg-surface-hover focus:border-accent/50",
        className,
      )}
      aria-label={t("settings.language.label")}
    >
      {LANGUAGE_OPTIONS.map((option) => (
        <option key={option.code} value={option.code}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
