"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import type { PremiumPlanId } from "@/types/premium";

interface PremiumPlanCardProps {
  planId: PremiumPlanId;
  highlighted?: boolean;
  isCurrentPlan?: boolean;
  isPremium?: boolean;
  loading?: boolean;
  onUpgrade?: (planId: PremiumPlanId) => void;
}

const PLAN_PRICE_KEYS: Record<PremiumPlanId, string> = {
  FREE: "premium.plans.freePrice",
  PREMIUM_MONTHLY: "premium.plans.monthlyPrice",
  PREMIUM_YEARLY: "premium.plans.yearlyPrice",
};

const PLAN_TITLE_KEYS: Record<PremiumPlanId, string> = {
  FREE: "premium.plans.freeTitle",
  PREMIUM_MONTHLY: "premium.plans.monthlyTitle",
  PREMIUM_YEARLY: "premium.plans.yearlyTitle",
};

const PLAN_DESC_KEYS: Record<PremiumPlanId, string> = {
  FREE: "premium.plans.freeDesc",
  PREMIUM_MONTHLY: "premium.plans.monthlyDesc",
  PREMIUM_YEARLY: "premium.plans.yearlyDesc",
};

export function PremiumPlanCard({
  planId,
  highlighted = false,
  isCurrentPlan = false,
  isPremium = false,
  loading = false,
  onUpgrade,
}: PremiumPlanCardProps) {
  const { t } = useLanguage();
  const isFree = planId === "FREE";
  const canUpgrade = !isFree && !isPremium && Boolean(onUpgrade);

  function getButtonLabel() {
    if (isFree && !isPremium) {
      return t("premium.plans.currentFree");
    }

    if (isCurrentPlan) {
      return t("premium.plans.currentPlan");
    }

    if (canUpgrade) {
      return t("premium.plans.upgrade");
    }

    if (isPremium) {
      return t("premium.plans.manageInSettings");
    }

    return t("premium.plans.upgrade");
  }

  return (
    <Card
      className={cn(
        "flex h-full flex-col border-border/80 p-6",
        highlighted &&
          "border-violet-400/40 bg-gradient-to-b from-violet-500/10 to-indigo-500/5 shadow-[0_0_40px_rgba(139,92,246,0.12)]",
      )}
      glow={highlighted}
    >
      {highlighted ? (
        <span className="mb-3 inline-flex w-fit rounded-full border border-violet-400/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-100">
          {t("premium.plans.recommended")}
        </span>
      ) : null}

      <h3 className="text-lg font-semibold">{t(PLAN_TITLE_KEYS[planId])}</h3>
      <p className="mt-2 text-2xl font-semibold text-foreground">
        {t(PLAN_PRICE_KEYS[planId])}
      </p>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
        {t(PLAN_DESC_KEYS[planId])}
      </p>

      <Button
        variant={highlighted ? "primary" : "secondary"}
        className="mt-6 w-full"
        disabled={isFree || isCurrentPlan || loading || !canUpgrade}
        onClick={() => onUpgrade?.(planId)}
      >
        {loading ? t("premium.plans.redirecting") : getButtonLabel()}
      </Button>
    </Card>
  );
}
