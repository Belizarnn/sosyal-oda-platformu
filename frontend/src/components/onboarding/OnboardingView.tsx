"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { cn } from "@/lib/cn";

const ONBOARDING_OPTIONS = [
  {
    id: "chat",
    labelKey: "onboarding.options.chat",
    href: "/rooms?category=CHAT",
  },
  {
    id: "watch",
    labelKey: "onboarding.options.watch",
    href: "/rooms?category=ANIME",
  },
  {
    id: "study",
    labelKey: "onboarding.options.study",
    href: "/rooms?category=STUDY",
  },
  {
    id: "game",
    labelKey: "onboarding.options.game",
    href: "/rooms?category=GAME",
  },
  {
    id: "friends",
    labelKey: "onboarding.options.friends",
    href: "/friends",
  },
] as const;

export function OnboardingView() {
  const router = useRouter();
  const { t } = useLanguage();
  const { user, loading, isReady } = useRequireAuth();

  if (loading) {
    return (
      <LoadingSpinner label={t("onboarding.loading")} className="min-h-[50vh]" />
    );
  }

  if (!isReady || !user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {t("onboarding.firstQuestion")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {t("onboarding.firstQuestionDesc", { name: user.username })}
        </p>
      </div>

      <Card glow className="space-y-3 p-4 sm:p-6">
        {ONBOARDING_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => router.push(option.href)}
            className={cn(
              "w-full rounded-2xl border border-border bg-surface px-4 py-4 text-left text-sm font-medium transition",
              "hover:border-accent/30 hover:bg-surface-hover",
            )}
          >
            {t(option.labelKey)}
          </button>
        ))}
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="secondary" href="/dashboard">
          {t("onboarding.complete.dashboard")}
        </Button>
        <Button variant="ghost" href="/settings">
          {t("onboarding.skipProfile")}
        </Button>
      </div>
    </div>
  );
}
