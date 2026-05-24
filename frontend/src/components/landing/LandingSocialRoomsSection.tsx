"use client";

import { useTranslations } from "next-intl";
import { ScrollReveal, landingGlassCardClass, landingSectionClass } from "./ScrollReveal";

export function LandingSocialRoomsSection() {
  const t = useTranslations("landing.social");

  return (
    <section className={`${landingSectionClass} py-16 sm:py-24`}>
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <ScrollReveal direction="left">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("description")}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120} direction="right">
          <div className={`${landingGlassCardClass} overflow-hidden bg-gradient-to-br from-[#171028] via-[#1f1238] to-[#12081f] p-5 sm:p-6`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-violet-200">{t("mockActiveRooms")}</p>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">
                3 live
              </span>
            </div>

            <div className="space-y-3">
              {(["nightChat", "animeWatch", "studyRoom"] as const).map((roomKey) => (
                <div
                  key={roomKey}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{t(`mockRooms.${roomKey}`)}</p>
                    <p className="text-xs text-slate-400">8–14 online</p>
                  </div>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
              <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">
                {t("mockOnlineFriends")}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500" />
                  <div>
                    <p className="text-sm text-white">{t("mockPresence.studying")}</p>
                    <p className="text-xs text-emerald-300/80">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500" />
                  <div>
                    <p className="text-sm text-white">{t("mockPresence.inRoom")}</p>
                    <p className="text-xs text-violet-200/80">In voice</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-4">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                {t("mockChatPreview")}
              </p>
              <div className="space-y-2">
                <div className="rounded-lg bg-white/5 px-3 py-2 text-xs text-slate-300">
                  Sudenaz: Bu akşam watch party var mı?
                </div>
                <div className="rounded-lg bg-violet-500/10 px-3 py-2 text-xs text-violet-100">
                  Yavuzhan: Anime odasına geçelim 🎬
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
