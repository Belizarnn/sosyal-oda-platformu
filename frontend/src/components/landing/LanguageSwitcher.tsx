"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLandingLocale, type LandingLocale } from "@/contexts/LandingIntlProvider";
import { cn } from "@/lib/cn";

const LOCALE_OPTIONS: LandingLocale[] = ["tr", "en", "de"];

export function LanguageSwitcher() {
  const t = useTranslations("landing.language");
  const { locale, setLocale } = useLandingLocale();

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/20 p-1 backdrop-blur-md"
      role="group"
      aria-label={t("label")}
    >
      {LOCALE_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={cn(
            "min-h-10 rounded-full px-3 py-2 text-xs font-medium uppercase tracking-wide transition",
            locale === option
              ? "bg-violet-500/30 text-violet-100 shadow-[0_0_20px_rgba(167,139,250,0.25)]"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
          )}
          aria-pressed={locale === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export function LandingHeader() {
  const t = useTranslations("landing");

  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
      <Link href="/" className="text-lg font-semibold tracking-tight text-white">
        {t("brand")}
      </Link>
      <LanguageSwitcher />
    </header>
  );
}
