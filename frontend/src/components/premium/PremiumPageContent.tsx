"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PremiumFeatureCard } from "@/components/premium/PremiumFeatureCard";
import { PremiumPlanCard } from "@/components/premium/PremiumPlanCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ApiError, createCheckoutSession, getPremiumStatus } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type { PremiumCheckoutPlan, PremiumPlanId } from "@/types/premium";

const FEATURES = [
  {
    icon: "✦",
    titleKey: "premium.features.badge.title",
    descriptionKey: "premium.features.badge.desc",
  },
  {
    icon: "◎",
    titleKey: "premium.features.frame.title",
    descriptionKey: "premium.features.frame.desc",
  },
  {
    icon: "◉",
    titleKey: "premium.features.avatar.title",
    descriptionKey: "premium.features.avatar.desc",
  },
  {
    icon: "▣",
    titleKey: "premium.features.roomThemes.title",
    descriptionKey: "premium.features.roomThemes.desc",
  },
  {
    icon: "✧",
    titleKey: "premium.features.profile.title",
    descriptionKey: "premium.features.profile.desc",
  },
  {
    icon: "♡",
    titleKey: "premium.features.supporter.title",
    descriptionKey: "premium.features.supporter.desc",
  },
] as const;

const CHECKOUT_PLAN_MAP: Record<
  Extract<PremiumPlanId, "PREMIUM_MONTHLY" | "PREMIUM_YEARLY">,
  PremiumCheckoutPlan
> = {
  PREMIUM_MONTHLY: "MONTHLY",
  PREMIUM_YEARLY: "YEARLY",
};

export function PremiumPageContent() {
  const { t } = useLanguage();
  const router = useRouter();
  const { isReady } = useRequireAuth();
  const [statusLoading, setStatusLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("premium_page_opened");
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void getPremiumStatus()
      .then((response) => {
        setIsPremium(response.isPremium);
        setCurrentPlan(response.plan);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : t("premium.status.loadError"),
        );
      })
      .finally(() => setStatusLoading(false));
  }, [isReady, t]);

  async function handleUpgrade(planId: PremiumPlanId) {
    if (planId === "FREE" || !isReady) {
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const result = await createCheckoutSession(CHECKOUT_PLAN_MAP[planId]);
      window.location.href = result.checkoutUrl;
    } catch (err) {
      setCheckoutLoading(false);
      setError(
        err instanceof ApiError ? err.message : t("premium.checkout.error"),
      );
    }
  }

  if (!isReady) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 via-indigo-950/20 to-surface px-6 py-10 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.18),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.12),transparent_40%)]"
        />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wider text-violet-300/90">
            {t("premium.hero.eyebrow")}
          </p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
            {t("premium.hero.title")}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">
            {t("premium.hero.subtitle")}
          </p>
          <p className="mt-3 text-sm text-violet-200/80">{t("premium.hero.note")}</p>
        </div>
      </section>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <section className="grid gap-4 lg:grid-cols-3">
        <PremiumPlanCard
          planId="FREE"
          isPremium={isPremium}
          isCurrentPlan={!isPremium}
        />
        <PremiumPlanCard
          planId="PREMIUM_MONTHLY"
          isPremium={isPremium}
          isCurrentPlan={currentPlan === "PREMIUM_MONTHLY"}
          loading={checkoutLoading || statusLoading}
          onUpgrade={handleUpgrade}
        />
        <PremiumPlanCard
          planId="PREMIUM_YEARLY"
          highlighted
          isPremium={isPremium}
          isCurrentPlan={currentPlan === "PREMIUM_YEARLY"}
          loading={checkoutLoading || statusLoading}
          onUpgrade={handleUpgrade}
        />
      </section>

      {isPremium ? (
        <p className="text-sm text-muted">
          {t("premium.settings.manageHint")}{" "}
          <button
            type="button"
            className="text-violet-300 hover:underline"
            onClick={() => router.push("/settings")}
          >
            {t("premium.settings.title")}
          </button>
        </p>
      ) : null}

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("premium.features.title")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <PremiumFeatureCard
              key={feature.titleKey}
              icon={feature.icon}
              titleKey={feature.titleKey}
              descriptionKey={feature.descriptionKey}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
