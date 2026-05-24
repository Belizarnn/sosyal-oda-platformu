"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ReportStatusBadge } from "@/components/admin/ReportStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { getReportTargetLabel, getReportStatusLabel } from "@/i18n/utils";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { ApiError, getAdminReports, type AdminReport } from "@/lib/api";
import { formatShortDate } from "@/lib/formatDate";
import type { ReportStatus, ReportTargetType } from "@/types/admin";
import { REPORT_STATUS_OPTIONS, REPORT_TARGET_TYPE_OPTIONS } from "@/types/admin";

export function AdminReportsView() {
  const { t } = useLanguage();
  const { loading, forbidden, isReady } = useAdminAccess();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [reportsNextCursor, setReportsNextCursor] = useState<string | null>(null);
  const [loadingMoreReports, setLoadingMoreReports] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<ReportTargetType | "">("");
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setListLoading(true);
    setError(null);

    try {
      const response = await getAdminReports({
        status: statusFilter || undefined,
        targetType: targetTypeFilter || undefined,
        limit: 20,
      });
      setReports(response.reports);
      setReportsNextCursor(response.nextCursor ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.reports.loadFailed"),
      );
    } finally {
      setListLoading(false);
    }
  }, [statusFilter, targetTypeFilter, t]);

  async function handleLoadMoreReports() {
    if (!reportsNextCursor || loadingMoreReports) {
      return;
    }

    setLoadingMoreReports(true);

    try {
      const response = await getAdminReports({
        status: statusFilter || undefined,
        targetType: targetTypeFilter || undefined,
        limit: 20,
        cursor: reportsNextCursor,
      });
      setReports((current) => [...current, ...response.reports]);
      setReportsNextCursor(response.nextCursor ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.reports.loadFailed"),
      );
    } finally {
      setLoadingMoreReports(false);
    }
  }

  useEffect(() => {
    if (!isReady || forbidden) {
      return;
    }

    void loadReports();
  }, [forbidden, isReady, loadReports]);

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

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-muted hover:text-foreground">
            {t("admin.backToPanel")}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{t("admin.reports.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("admin.reports.subtitle")}</p>
        </div>
      </div>

      <Card className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-muted">{t("admin.reports.statusFilter")}</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ReportStatus | "")
            }
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-accent/50"
            aria-label={t("admin.reports.statusFilter")}
          >
            <option value="">{t("admin.reports.all")}</option>
            {REPORT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {getReportStatusLabel(option.value, t)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm text-muted">{t("admin.reports.targetFilter")}</span>
          <select
            value={targetTypeFilter}
            onChange={(event) =>
              setTargetTypeFilter(event.target.value as ReportTargetType | "")
            }
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-accent/50"
            aria-label={t("admin.reports.targetFilter")}
          >
            <option value="">{t("admin.reports.all")}</option>
            {REPORT_TARGET_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {getReportTargetLabel(option.value, t)}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {listLoading ? (
        <LoadingState label={t("states.loading.reports")} rows={3} />
      ) : error ? (
        <ErrorState
          title={t("states.error.loadFailed")}
          description={error}
          onRetry={() => void loadReports()}
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon="⚠"
          title={t("states.empty.noReports")}
          description={t("states.empty.noReportsDesc")}
        />
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <ReportStatusBadge status={report.status} />
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                    {getReportTargetLabel(report.targetType, t)}
                  </span>
                </div>
                <p className="font-medium">{report.reason}</p>
                <p className="text-sm text-muted">
                  @{report.reporter.handle} · {formatShortDate(report.createdAt)}
                </p>
              </div>
              <Button variant="secondary" href={`/admin/reports/${report.id}`} size="sm">
                {t("common.details")}
              </Button>
            </Card>
          ))}
          {reportsNextCursor ? (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                disabled={loadingMoreReports}
                onClick={() => void handleLoadMoreReports()}
              >
                {loadingMoreReports ? t("common.loading") : t("common.loadMore")}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
