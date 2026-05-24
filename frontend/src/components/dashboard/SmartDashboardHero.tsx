"use client";

import { PresenceDot } from "@/components/presence/PresenceDot";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AuthUser } from "@/lib/api";
import { getPresenceLabel, getPresenceMeta } from "@/lib/presence";

interface SmartDashboardHeroProps {
  user: AuthUser;
}

export function SmartDashboardHero({ user }: SmartDashboardHeroProps) {
  const { t } = useLanguage();
  const presenceMeta = getPresenceMeta(user.presenceStatus);

  return (
    <Card glow className="relative overflow-hidden p-6 sm:p-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_20%_20%,var(--accent-soft),transparent_60%)]"
      />
      <div className="relative space-y-3">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {t("dashboard.welcome", { name: user.username })}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>@{user.handle}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs">
            <PresenceDot status={user.presenceStatus} className="h-2 w-2" />
            <span className={presenceMeta.textClass}>
              {getPresenceLabel(user.presenceStatus, t)}
            </span>
          </span>
        </div>
        {user.statusMessage ? (
          <p className="text-sm text-foreground/85">“{user.statusMessage}”</p>
        ) : null}
        <p className="pt-1 text-base text-muted">{t("dashboard.todayQuestion")}</p>
      </div>
    </Card>
  );
}
