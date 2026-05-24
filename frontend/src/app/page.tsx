"use client";

import { useState } from "react";
import { LandingIntlProvider } from "@/contexts/LandingIntlProvider";
import { LandingAppPreviewSection } from "@/components/landing/LandingAppPreviewSection";
import { LandingAuthModal } from "@/components/landing/LandingAuthModal";
import { LandingFeatureSection } from "@/components/landing/LandingFeatureSection";
import { LandingFinalCTA } from "@/components/landing/LandingFinalCTA";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHeader } from "@/components/landing/LanguageSwitcher";
import { LandingSocialRoomsSection } from "@/components/landing/LandingSocialRoomsSection";
import { LandingWatchTogetherSection } from "@/components/landing/LandingWatchTogetherSection";
import { BetaBanner } from "@/components/beta/BetaBanner";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { LandingFooter } from "@/components/layout/LandingFooter";

function LandingPageContent() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="landing-shell relative min-h-screen overflow-x-hidden text-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 landing-glow-bg" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      <LandingHeader />

      <div className="relative z-10 px-4 pt-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <BetaBanner className="border-white/15 bg-white/5 text-slate-100" />
        </div>
      </div>

      <main className="relative z-10">
        <LandingHero onOpenAuthModal={() => setAuthModalOpen(true)} />
        <LandingFeatureSection />
        <LandingSocialRoomsSection />
        <LandingWatchTogetherSection />
        <LandingAppPreviewSection />
        <LandingFinalCTA onOpenAuthModal={() => setAuthModalOpen(true)} />
      </main>

      <LandingFooter />

      <LandingAuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <FeedbackButton variant="landing" />
    </div>
  );
}

export default function LandingPage() {
  return (
    <LandingIntlProvider>
      <LandingPageContent />
    </LandingIntlProvider>
  );
}
