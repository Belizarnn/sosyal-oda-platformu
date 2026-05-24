"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FeedbackStatusBadge } from "@/components/admin/FeedbackStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeedbackStatusLabel, getFeedbackTypeLabel } from "@/i18n/utils";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import {
  ApiError,
  getAdminFeedback,
  updateAdminFeedbackStatus,
  type AdminFeedbackItem,
} from "@/lib/api";
import { formatShortDate } from "@/lib/formatDate";
import { isAdminRole } from "@/types/admin";
import {
  FEEDBACK_STATUS_OPTIONS,
  FEEDBACK_TYPE_OPTIONS,
  type FeedbackStatus,
  type FeedbackType,
} from "@/types/feedback";

export function AdminFeedbackView() {
  const { t } = useLanguage();
  const { loading, forbidden, isReady, user } = useAdminAccess();
  const [items, setItems] = useState<AdminFeedbackItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<FeedbackType | "">("");
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const canUpdateStatus = isAdminRole(user?.role);

  const loadFeedback = useCallback(async () => {
    setListLoading(true);
    setError(null);

    try {
      const response = await getAdminFeedback({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        limit: 20,
      });
      setItems(response.feedback);
      setNextCursor(response.nextCursor ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.feedback.loadFailed"),
      );
    } finally {
      setListLoading(false);
    }
  }, [statusFilter, typeFilter, t]);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const response = await getAdminFeedback({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        limit: 20,
        cursor: nextCursor,
      });
      setItems((current) => [...current, ...response.feedback]);
      setNextCursor(response.nextCursor ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.feedback.loadFailed"),
      );
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleStatusUpdate(feedbackId: string, status: FeedbackStatus) {
    if (!canUpdateStatus) {
      return;
    }

    setUpdatingId(feedbackId);

    try {
      const response = await updateAdminFeedbackStatus(feedbackId, status);
      setItems((current) =>
        current.map((item) =>
          item.id === feedbackId ? response.feedback : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("admin.feedback.updateFailed"),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  useEffect(() => {
    if (!isReady || forbidden) {
      return;
    }

    void loadFeedback();
  }, [forbidden, isReady, loadFeedback]);

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
      <div>
        <Link href="/admin" className="text-sm text-muted hover:text-foreground">
          {t("admin.backToPanel")}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{t("admin.feedback.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("admin.feedback.subtitle")}</p>
      </div>

      <Card className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="text-sm text-muted">{t("admin.feedback.statusFilter")}</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as FeedbackStatus | "")
            }
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent/50"
          >
            <option value="">{t("admin.feedback.all")}</option>
            {FEEDBACK_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="text-sm text-muted">{t("admin.feedback.typeFilter")}</span>
          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value as FeedbackType | "")
            }
            className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent/50"
          >
            <option value="">{t("admin.feedback.all")}</option>
            {FEEDBACK_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.labelKey)}
              </option>
            ))}
          </select>
        </label>
      </Card>

      {listLoading ? (
        <LoadingState label={t("admin.feedback.loading")} rows={3} />
      ) : error ? (
        <ErrorState
          title={t("states.error.loadFailed")}
          description={error}
          onRetry={() => void loadFeedback()}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon="💬"
          title={t("admin.feedback.emptyTitle")}
          description={t("admin.feedback.emptyDesc")}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <Card key={item.id} className="space-y-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <FeedbackStatusBadge status={item.status} />
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                        {getFeedbackTypeLabel(item.type, t)}
                      </span>
                      {item.rating ? (
                        <span className="text-xs text-muted">
                          {t("admin.feedback.ratingValue", { rating: item.rating })}
                        </span>
                      ) : null}
                    </div>
                    <h2 className="font-medium">{item.title}</h2>
                    <p className="text-sm text-muted">
                      {item.user
                        ? `@${item.user.handle} · ${item.user.username}`
                        : t("admin.feedback.anonymous")}
                      {" · "}
                      {formatShortDate(item.createdAt)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  >
                    {isExpanded
                      ? t("admin.feedback.hideDetail")
                      : t("admin.feedback.showDetail")}
                  </Button>
                </div>

                {isExpanded ? (
                  <div className="space-y-3 border-t border-border pt-3">
                    <p className="whitespace-pre-wrap text-sm">{item.message}</p>
                    {item.pageUrl ? (
                      <p className="text-xs text-muted">
                        {t("admin.feedback.pageUrl")}: {item.pageUrl}
                      </p>
                    ) : null}

                    {canUpdateStatus ? (
                      <div className="flex flex-wrap gap-2">
                        {FEEDBACK_STATUS_OPTIONS.map((option) => (
                          <Button
                            key={option.value}
                            type="button"
                            variant={
                              item.status === option.value ? "primary" : "secondary"
                            }
                            disabled={updatingId === item.id}
                            onClick={() =>
                              void handleStatusUpdate(item.id, option.value)
                            }
                          >
                            {getFeedbackStatusLabel(option.value, t)}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted">
                        {t("admin.feedback.moderatorNote")}
                      </p>
                    )}
                  </div>
                ) : null}
              </Card>
            );
          })}

          {nextCursor ? (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="secondary"
                disabled={loadingMore}
                onClick={() => void handleLoadMore()}
              >
                {loadingMore ? t("common.loading") : t("common.loadMore")}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
