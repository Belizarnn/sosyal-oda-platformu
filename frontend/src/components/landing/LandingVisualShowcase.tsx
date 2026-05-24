"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal, landingGlassCardClass } from "./ScrollReveal";

export function LandingVisualShowcase() {
  const t = useTranslations("landing.hero");

  return (
    <ScrollReveal delay={160} className="relative mx-auto mt-10 w-full max-w-5xl overflow-x-hidden sm:mt-14">
      <div className="relative flex min-h-[320px] items-center justify-center sm:min-h-[420px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-8 top-1/2 h-40 -translate-y-1/2 rounded-full bg-violet-600/20 blur-3xl"
        />

        {/* Canva export görseli buraya yerleştirilecek: hero-left.png */}
        <ScrollReveal
          delay={80}
          direction="left"
          className="absolute left-0 top-8 hidden w-36 sm:block lg:w-44"
        >
          <div
            className={`${landingGlassCardClass} h-40 bg-gradient-to-br from-violet-900/40 to-indigo-900/20 p-4`}
          >
            <div className="mb-3 h-2 w-12 rounded-full bg-violet-300/40" />
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-white/10" />
              <div className="h-2 w-4/5 rounded-full bg-white/10" />
              <div className="h-2 w-3/5 rounded-full bg-white/10" />
            </div>
          </div>
        </ScrollReveal>

        {/* Canva export görseli buraya yerleştirilecek: hero-main.png */}
        <div
          className={`${landingGlassCardClass} relative z-10 w-full max-w-2xl overflow-hidden bg-gradient-to-br from-[#1a1033] via-[#241047] to-[#12081f] p-6 sm:p-8`}
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-violet-300/80">Social Room</p>
              <p className="mt-1 text-lg font-semibold text-white">{t("title")}</p>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              Live
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-slate-400">Active rooms</p>
              <p className="mt-2 text-sm font-medium text-white">Gece Sohbet Odası</p>
              <p className="mt-1 text-xs text-violet-200/80">12 online</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs text-slate-400">Watch Party</p>
              <p className="mt-2 text-sm font-medium text-white">Anime Watch Party</p>
              <p className="mt-1 text-xs text-violet-200/80">Sync playing</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500" />
              <div>
                <p className="text-sm font-medium text-white">Sudenaz</p>
                <p className="text-xs text-slate-400">studying in Software Study Room</p>
              </div>
            </div>
          </div>
        </div>

        {/* Canva export görseli buraya yerleştirilecek: hero-right.png */}
        <ScrollReveal
          delay={240}
          direction="right"
          className="absolute right-0 top-16 hidden w-36 sm:block lg:w-44"
        >
          <div
            className={`${landingGlassCardClass} h-44 bg-gradient-to-br from-fuchsia-900/30 to-violet-900/20 p-4`}
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-violet-400/30" />
              <div className="space-y-1.5">
                <div className="h-2 w-16 rounded-full bg-white/10" />
                <div className="h-2 w-10 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-white/10" />
              <div className="h-2 w-2/3 rounded-full bg-white/10" />
            </div>
          </div>
        </ScrollReveal>
      </div>
    </ScrollReveal>
  );
}
