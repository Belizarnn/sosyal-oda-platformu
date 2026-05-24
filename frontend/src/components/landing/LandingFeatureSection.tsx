"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal, landingGlassCardClass, landingSectionClass } from "./ScrollReveal";

const FEATURE_KEYS = [
  "socialRooms",
  "voiceChat",
  "realtimeChat",
  "watchParty",
  "studyRooms",
  "gameLobby",
] as const;

const FEATURE_ICONS: Record<(typeof FEATURE_KEYS)[number], string> = {
  socialRooms: "◎",
  voiceChat: "🎙",
  realtimeChat: "💬",
  watchParty: "▶",
  studyRooms: "📚",
  gameLobby: "🎮",
};

export function LandingFeatureSection() {
  const t = useTranslations("landing.features");

  return (
    <section className={`${landingSectionClass} py-16 sm:py-24`}>
      <ScrollReveal>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
        </div>
      </ScrollReveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURE_KEYS.map((key, index) => (
          <ScrollReveal key={key} delay={index * 80}>
            <article className={`${landingGlassCardClass} h-full p-6 text-left`}>
              <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 text-lg">
                {FEATURE_ICONS[key]}
              </span>
              <h3 className="text-lg font-semibold text-white">{t(`items.${key}.title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {t(`items.${key}.description`)}
              </p>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
