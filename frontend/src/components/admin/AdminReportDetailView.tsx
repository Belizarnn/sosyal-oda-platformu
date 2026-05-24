"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ReportStatusBadge } from "@/components/admin/ReportStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { getReportStatusLabel, getReportTargetLabel } from "@/i18n/utils";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  ApiError,
  getAdminReportById,
  updateAdminReportStatus,
  type AdminReport,
} from "@/lib/api";
import { formatShortDate } from "@/lib/formatDate";
import type { ReportStatus } from "@/types/admin";
import { REPORT_STATUS_OPTIONS } from "@/types/admin";

export function AdminReportDetailView() {
  const params = useParams<{ reportId: string }>();
  const reportId = params.reportId;
  const { t } = useLanguage();
  const { loading, forbidden, isReady, isAdmin } = useAdminAccess();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [report, setReport] = useState<AdminReport | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus>("OPEN");
  const [detailLoading, setDetailLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setDetailLoading(true);
    setError(null);

    try {
      const response = await getAdminReportById(reportId);
      setReport(response.report);
      setSelectedStatus(response.report.status);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.reportDetail.loadFailed"),
      );
    } finally {
      setDetailLoading(false);
    }
  }, [reportId, t]);

  useEffect(() => {
    if (!isReady || forbidden) {
      return;
    }

    void loadReport();
  }, [forbidden, isReady, loadReport]);

  async function handleUpdateStatus() {
    if (!report || !isAdmin) {
      return;
    }

    setUpdating(true);

    try {
      const response = await updateAdminReportStatus(report.id, selectedStatus);
      setReport(response.report);
      setSelectedStatus(response.report.status);
      showSuccessToast(t("admin.reports.statusUpdated"));
    } catch (err) {
      showErrorToast(
        err instanceof ApiError ? err.message : t("states.error.loadFailed"),
      );
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <LoadingSpinner label={t("states.loading.admin")} className="min-h-[40vh]" />
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

  if (detailLoading) {
    return (
      <LoadingSpinner
        label={t("states.loading.reportDetail")}
        className="min-h-[40vh]"
      />
    );
  }

  if (error || !report) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title={t("states.error.reportNotFound")}
          description={error ?? t("admin.reportDetail.notFoundDesc")}
          onRetry={() => void loadReport()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <Link href="/admin/reports" className="text-sm text-muted hover:text-foreground">
          {t("admin.backToReports")}
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{t("admin.reportDetail.title")}</h1>
          <ReportStatusBadge status={report.status} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card glow className="space-y-4">
          <h2 className="font-semibold">{t("admin.reportDetail.info")}</h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted">{t("admin.reportDetail.reason")}</dt>
              <dd className="mt-1 font-medium">{report.reason}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("admin.reportDetail.description")}</dt>
              <dd className="mt-1">
                {report.description || t("admin.reportDetail.noDescription")}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("admin.reportDetail.targetType")}</dt>
              <dd className="mt-1">{getReportTargetLabel(report.targetType, t)}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("admin.reportDetail.createdAt")}</dt>
              <dd className="mt-1">{formatShortDate(report.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold">{t("admin.reportDetail.reporter")}</h2>
          <p className="text-sm">
            {report.reporter.username}{" "}
            <span className="text-muted">@{report.reporter.handle}</span>
          </p>
          <Button variant="secondary" size="sm" href={`/profile/${report.reporter.handle}`}>
            {t("friends.viewProfile")}
          </Button>
        </Card>
      </div>

      {(report.targetUser || report.targetRoom || report.targetMessage) && (
        <Card className="space-y-4">
          <h2 className="font-semibold">{t("admin.reportDetail.targetInfo")}</h2>

          {report.targetUser ? (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-medium">{t("admin.report.user")}</p>
              <p className="mt-1 text-sm text-muted">
                {report.targetUser.username} (@{report.targetUser.handle})
              </p>
              {report.links.profilePath ? (
                <Button
                  variant="secondary"
                  size="sm"
                  href={report.links.profilePath}
                  className="mt-3"
                >
                  {t("admin.reportDetail.goToProfile")}
                </Button>
              ) : null}
            </div>
          ) : null}

          {report.targetRoom ? (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-medium">{t("admin.report.room")}</p>
              <p className="mt-1 text-sm text-muted">{report.targetRoom.name}</p>
              {report.links.roomPath ? (
                <Button
                  variant="secondary"
                  size="sm"
                  href={report.links.roomPath}
                  className="mt-3"
                >
                  {t("admin.reportDetail.goToRoom")}
                </Button>
              ) : null}
            </div>
          ) : null}

          {report.targetMessage ? (
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-sm font-medium">{t("admin.report.message")}</p>
              <p className="mt-2 text-sm">{report.targetMessage.content}</p>
              <p className="mt-2 text-xs text-muted">
                {t("admin.reportDetail.sender", {
                  handle: report.targetMessage.sender.handle,
                })}
              </p>
              {report.links.roomPath ? (
                <Button
                  variant="secondary"
                  size="sm"
                  href={report.links.roomPath}
                  className="mt-3"
                >
                  {t("admin.reportDetail.goToRelatedRoom")}
                </Button>
              ) : null}
            </div>
          ) : null}
        </Card>
      )}

      <Card className="space-y-4">
        <h2 className="font-semibold">{t("admin.reportDetail.statusManagement")}</h2>

        {isAdmin ? (
          <>
            <label className="block space-y-1.5">
              <span className="text-sm text-muted">{t("admin.reportDetail.statusLabel")}</span>
              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as ReportStatus)
                }
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-accent/50"
                aria-label={t("admin.reportDetail.statusLabel")}
              >
                {REPORT_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {getReportStatusLabel(option.value, t)}
                  </option>
                ))}
              </select>
            </label>
            <Button
              onClick={() => void handleUpdateStatus()}
              disabled={updating || selectedStatus === report.status}
            >
              {updating ? t("common.updating") : t("admin.reports.updateStatus")}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted">{t("admin.reports.moderatorNote")}</p>
        )}
      </Card>
    </div>
  );
}
