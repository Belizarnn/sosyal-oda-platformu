"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ScrollReveal, landingGlassCardClass, landingSectionClass } from "./ScrollReveal";
import { trackEvent } from "@/lib/analytics";

interface LandingFinalCTAProps {
  onOpenAuthModal: () => void;
}

export function LandingFinalCTA({ onOpenAuthModal }: LandingFinalCTAProps) {
  const t = useTranslations("landing.finalCta");

  return (
    <section className={`${landingSectionClass} py-16 sm:py-24`}>
      <ScrollReveal>
        <div
          className={`${landingGlassCardClass} relative overflow-hidden px-6 py-12 text-center sm:px-10 sm:py-16`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.22),transparent_60%)]"
          />
          <div className="relative">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t("description")}
            </p>
            <div className="mt-8 flex justify-center">
              <Button
                size="lg"
                onClick={() => {
                  trackEvent("landing_cta_clicked", { source: "final_cta" });
                  onOpenAuthModal();
                }}
                className="min-w-[220px] bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-[0_0_40px_rgba(124,58,237,0.35)] hover:brightness-110"
              >
                {t("button")}
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
