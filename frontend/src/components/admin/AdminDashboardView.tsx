"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { ApiError, getAdminSummary, type AdminSummary } from "@/lib/api";

export function AdminDashboardView() {
  const { t } = useLanguage();
  const { loading, forbidden, isReady } = useAdminAccess();
  const [summary, setSummary] = useState<AdminSummary | null>(null);
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
        const data = await getAdminSummary();
        setSummary(data);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : t("admin.summary.loadFailed"),
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
        { labelKey: "admin.stats.usersCount", value: summary.usersCount, icon: "◉" },
        { labelKey: "admin.stats.roomsCount", value: summary.roomsCount, icon: "◎" },
        {
          labelKey: "admin.stats.activeRoomsCount",
          value: summary.activeRoomsCount,
          icon: "◫",
        },
        {
          labelKey: "admin.stats.openReportsCount",
          value: summary.openReportsCount,
          icon: "⚠",
        },
        {
          labelKey: "admin.stats.messagesCount",
          value: summary.messagesCount,
          icon: "✉",
        },
      ]
    : [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("admin.subtitle")}</p>
      </div>

      {summaryLoading ? (
        <LoadingState label={t("states.loading.summary")} rows={2} />
      ) : error ? (
        <ErrorState title={t("states.error.summaryLoadFailed")} description={error} />
      ) : (
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
      )}

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">{t("admin.reportManagement.title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("admin.reportManagement.subtitle")}</p>
        </div>
        <Button href="/admin/reports">{t("admin.viewReports")}</Button>
      </Card>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">{t("admin.analytics.title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("admin.analytics.cardSubtitle")}</p>
        </div>
        <Button href="/admin/analytics" variant="secondary">
          {t("admin.analytics.view")}
        </Button>
      </Card>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">{t("admin.feedback.cardTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("admin.feedback.cardSubtitle")}</p>
        </div>
        <Button href="/admin/feedback" variant="secondary">
          {t("admin.feedback.view")}
        </Button>
      </Card>

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">{t("admin.betaCodes.cardTitle")}</h2>
          <p className="mt-1 text-sm text-muted">{t("admin.betaCodes.cardSubtitle")}</p>
        </div>
        <Button href="/admin/beta-codes" variant="secondary">
          {t("admin.betaCodes.view")}
        </Button>
      </Card>

      <p className="text-xs text-muted">{t("admin.mvpNote")}</p>
    </div>
  );
}
