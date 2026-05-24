"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { ApiError, getAdminAnalyticsSummary, type AdminAnalyticsSummary } from "@/lib/api";

export function AdminAnalyticsView() {
  const { t } = useLanguage();
  const { loading, forbidden, isReady } = useAdminAccess();
  const [summary, setSummary] = useState<AdminAnalyticsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady || forbidden) {
      return;
    }

    async function loadSummary() {
      setSummaryLoading(true);
      setError(null);

      try {
        const data = await getAdminAnalyticsSummary();
        setSummary(data);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : t("admin.analytics.loadFailed"),
        );
      } finally {
        setSummaryLoading(false);
      }
    }

    void loadSummary();
  }, [forbidden, isReady, t]);

  if (loading) {
    return (
      <LoadingState
        label={t("states.loading.admin")}
        rows={2}
        className="mx-auto max-w-5xl"
      />
    );
  }

  if (forbidden) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title={t("common.accessDeniedTitle")}
          description={t("common.accessDenied")}
        />
      </div>
    );
  }

  const cards = summary
    ? [
        {
          labelKey: "admin.analytics.usersRegistered",
          value: summary.usersRegistered,
          icon: "◉",
        },
        {
          labelKey: "admin.analytics.roomsCreated",
          value: summary.roomsCreated,
          icon: "◎",
        },
        {
          labelKey: "admin.analytics.messagesSent",
          value: summary.messagesSent,
          icon: "✉",
        },
        {
          labelKey: "admin.analytics.dmMessagesSent",
          value: summary.dmMessagesSent,
          icon: "💬",
        },
        {
          labelKey: "admin.analytics.watchPartiesStarted",
          value: summary.watchPartiesStarted,
          icon: "▶",
        },
        {
          labelKey: "admin.analytics.activeUsersToday",
          value: summary.activeUsersToday,
          icon: "◫",
        },
      ]
    : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("admin.analytics.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("admin.analytics.subtitle")}</p>
        </div>
        <Button href="/admin" variant="secondary" size="sm">
          {t("admin.analytics.backToAdmin")}
        </Button>
      </div>

      {summaryLoading ? (
        <LoadingState label={t("states.loading.summary")} rows={2} />
      ) : error ? (
        <ErrorState title={t("states.error.summaryLoadFailed")} description={error} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Card key={card.labelKey} glow className="space-y-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-base text-accent">
                  {card.icon}
                </span>
                <p className="text-sm text-muted">{t(card.labelKey)}</p>
                <p className="text-3xl font-semibold">{card.value}</p>
              </Card>
            ))}
          </div>

          <Card className="border-dashed border-border/80 bg-surface/40 p-5">
            <p className="text-sm font-medium">{t("admin.analytics.trendPlaceholderTitle")}</p>
            <p className="mt-1 text-sm text-muted">
              {t("admin.analytics.trendPlaceholderDesc")}
            </p>
          </Card>
        </>
      )}

      <p className="text-xs text-muted">
        {t("admin.analytics.privacyNote")}{" "}
        <Link href="/admin" className="text-accent hover:underline">
          {t("admin.title")}
        </Link>
      </p>
    </div>
  );
}
