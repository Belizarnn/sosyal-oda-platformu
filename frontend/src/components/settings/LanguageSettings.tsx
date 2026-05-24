"use client";

import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_OPTIONS } from "@/i18n/languages";
import { useToast } from "@/components/ui/ToastProvider";

export function LanguageSettings() {
  const { locale, setLocale, t } = useLanguage();
  const { success } = useToast();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value as typeof locale;
    setLocale(nextLocale);
    success(t("settings.language.saved"));
  }

  return (
    <Card glow className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("settings.language.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("settings.language.subtitle")}</p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm text-muted">{t("settings.language.label")}</span>
        <select
          value={locale}
          onChange={handleChange}
          className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)]"
          aria-label={t("settings.language.label")}
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </Card>
  );
}
