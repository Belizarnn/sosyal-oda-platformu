"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal, landingGlassCardClass, landingSectionClass } from "./ScrollReveal";

const PREVIEW_KEYS = [
  { key: "dashboard", file: "dashboard-preview.png" },
  { key: "room", file: "room-preview.png" },
  { key: "chat", file: "chat-preview.png" },
  { key: "watch", file: "watch-preview.png" },
  { key: "profile", file: "profile-preview.png" },
  { key: "dm", file: "dm-preview.png" },
] as const;

export function LandingAppPreviewSection() {
  const t = useTranslations("landing.preview");

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

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PREVIEW_KEYS.map(({ key, file }, index) => (
          <ScrollReveal key={key} delay={index * 80}>
            <article className={`${landingGlassCardClass} overflow-hidden`}>
              {/* Canva export görseli buraya yerleştirilecek: frontend/public/landing/{file} */}
              <div className="aspect-[4/3] bg-gradient-to-br from-violet-900/35 via-indigo-900/20 to-black/50">
                <div className="flex h-full items-end p-4">
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-slate-300 backdrop-blur-sm">
                    {file}
                  </span>
                </div>
              </div>
              <div className="border-t border-white/10 px-4 py-3">
                <p className="text-sm font-medium text-white">{t(`items.${key}`)}</p>
              </div>
            </article>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
