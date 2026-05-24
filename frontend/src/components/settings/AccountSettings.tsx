"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { getIntlLocale } from "@/i18n/languages";
import type { AuthUser } from "@/lib/api";

interface AccountSettingsProps {
  user: AuthUser;
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const { t, locale } = useLanguage();

  function formatDate(value: string): string {
    return new Intl.DateTimeFormat(getIntlLocale(locale), {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <Card glow className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("settings.account.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("settings.account.subtitle")}</p>
      </div>

      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t("settings.account.username")}
          </dt>
          <dd className="mt-1 font-medium">{user.username}</dd>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t("settings.account.handle")}
          </dt>
          <dd className="mt-1 font-medium">@{user.handle}</dd>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t("settings.account.email")}
          </dt>
          <dd className="mt-1 font-medium">{user.email}</dd>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <dt className="text-xs uppercase tracking-wide text-muted">
            {t("settings.account.memberSince")}
          </dt>
          <dd className="mt-1 font-medium">{formatDate(user.createdAt)}</dd>
        </div>
      </dl>

      <Link href={`/profile/${user.handle}`}>
        <Button variant="secondary">{t("settings.account.viewProfile")}</Button>
      </Link>

      <div className="rounded-xl border border-border bg-surface p-4">
        <h3 className="font-medium">{t("feedback.settingsTitle")}</h3>
        <p className="mt-1 text-sm text-muted">{t("feedback.settingsDesc")}</p>
        <div className="mt-3">
          <FeedbackButton variant="inline" />
        </div>
      </div>
    </Card>
  );
}
