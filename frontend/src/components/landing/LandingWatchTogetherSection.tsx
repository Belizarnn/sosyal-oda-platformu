"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal, landingGlassCardClass, landingSectionClass } from "./ScrollReveal";

const WATCH_KEYS = ["youtube", "anime", "film", "live", "screenShare"] as const;

export function LandingWatchTogetherSection() {
  const t = useTranslations("landing.watch");

  return (
    <section className={`${landingSectionClass} py-16 sm:py-24`}>
      <ScrollReveal>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
            {t("description")}
          </p>
        </div>
      </ScrollReveal>

      <div className="mt-10 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {WATCH_KEYS.map((key, index) => (
          <ScrollReveal
            key={key}
            delay={index * 80}
            className="min-w-[260px] max-w-[280px] flex-shrink-0 sm:min-w-[280px]"
          >
            <article
              className={`${landingGlassCardClass} h-full bg-gradient-to-br from-[#181028]/90 to-[#12081f]/90 p-5`}
            >
              <div className="mb-4 aspect-video rounded-xl border border-white/10 bg-gradient-to-br from-violet-900/40 via-indigo-900/20 to-black/40" />
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
