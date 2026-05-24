"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ScrollReveal, landingSectionClass } from "./ScrollReveal";
import { LandingVisualShowcase } from "./LandingVisualShowcase";
import { trackEvent } from "@/lib/analytics";

interface LandingHeroProps {
  onOpenAuthModal: () => void;
}

export function LandingHero({ onOpenAuthModal }: LandingHeroProps) {
  const t = useTranslations("landing.hero");

  return (
    <section className={`${landingSectionClass} overflow-x-hidden pb-10 pt-8 sm:pb-16 sm:pt-12`}>
      <div className="mx-auto max-w-3xl text-center">
        <ScrollReveal>
          <h1 className="bg-gradient-to-b from-white via-violet-100 to-violet-300/80 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={80}>
          <p className="mt-5 text-xl font-medium text-violet-100/90 sm:text-2xl">{t("subtitle")}</p>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {t("description")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={160}>
          <div className="mt-10 flex justify-center">
            <Button
              size="lg"
              onClick={() => {
                trackEvent("landing_cta_clicked", { source: "hero" });
                onOpenAuthModal();
              }}
              className="min-w-[220px] bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:brightness-110"
            >
              {t("cta")}
            </Button>
          </div>
        </ScrollReveal>
      </div>

      <LandingVisualShowcase />
    </section>
  );
}
