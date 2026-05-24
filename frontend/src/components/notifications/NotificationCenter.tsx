"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NotificationFilters } from "@/components/notifications/NotificationFilters";
import { NotificationGroup } from "@/components/notifications/NotificationGroup";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api";
import { groupNotificationsByDate } from "@/lib/groupNotifications";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  filterToQuery,
  type Notification,
  type NotificationFilterId,
} from "@/types/notification";

export function NotificationCenter() {
  const { t } = useLanguage();
  const { user, loading: authLoading, isReady } = useRequireAuth();
  const { success: showSuccessToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterId>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const groupedNotifications = useMemo(
    () => groupNotificationsByDate(notifications),
    [notifications],
  );

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getNotifications({
        limit: 50,
        ...filterToQuery(activeFilter),
      });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setNextCursor(response.nextCursor ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : t("states.error.notificationsLoadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [activeFilter, t]);

  async function handleLoadMore() {
    if (!nextCursor || loadingMore) {
      return;
    }

    setLoadingMore(true);

    try {
      const response = await getNotifications({
        limit: 20,
        cursor: nextCursor,
        ...filterToQuery(activeFilter),
      });
      setNotifications((current) => [...current, ...response.notifications]);
      setUnreadCount(response.unreadCount);
      setNextCursor(response.nextCursor ?? null);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : t("states.error.notificationsLoadFailed"),
      );
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void loadNotifications();
  }, [isReady, loadNotifications]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-xl bg-surface" />
        <div className="h-40 rounded-2xl bg-surface" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  async function handleMarkAllRead() {
    setActionLoading(true);

    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
      showSuccessToast(t("notifications.markAllSuccess"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("notifications.actionFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteRead() {
    setActionLoading(true);

    try {
      await deleteAllNotifications({ onlyRead: true });
      await loadNotifications();
      showSuccessToast(t("notifications.deleteReadSuccess"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("notifications.actionFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleNotificationRead(notification: Notification) {
    if (notification.isRead) {
      return;
    }

    setActionLoadingId(notification.id);

    try {
      await markNotificationAsRead(notification.id);
      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("notifications.updateFailed"),
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleNotificationDelete(notification: Notification) {
    setActionLoadingId(notification.id);

    try {
      await deleteNotification(notification.id);
      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id),
      );
      if (!notification.isRead) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
      showSuccessToast(t("notifications.deleteSuccess"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("notifications.actionFailed"));
    } finally {
      setActionLoadingId(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{t("notifications.title")}</h1>
          <p className="mt-1 text-sm text-muted">
            {unreadCount > 0
              ? t("notifications.unreadFull", { count: unreadCount })
              : t("notifications.allRead")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 ? (
            <Button
              variant="secondary"
              onClick={() => void handleMarkAllRead()}
              disabled={actionLoading}
            >
              {actionLoading ? t("notifications.processing") : t("notifications.markAllRead")}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            onClick={() => void handleDeleteRead()}
            disabled={actionLoading}
          >
            {t("notifications.deleteRead")}
          </Button>
        </div>
      </div>

      <NotificationFilters
        activeFilter={activeFilter}
        unreadCount={unreadCount}
        onFilterChange={setActiveFilter}
      />

      {error ? (
        <ErrorState
          title={t("states.error.notificationsLoadFailed")}
          description={error}
        />
      ) : null}

      {loading ? (
        <LoadingState label={t("states.loading.notifications")} rows={2} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon="◔"
          title={t("notifications.emptyCenter")}
          description={t("notifications.emptyDescLong")}
        />
      ) : (
        <div className="space-y-6">
          <NotificationGroup
            group="today"
            notifications={groupedNotifications.today}
            actionLoadingId={actionLoadingId}
            onRead={(item) => void handleNotificationRead(item)}
            onDelete={(item) => void handleNotificationDelete(item)}
          />
          <NotificationGroup
            group="yesterday"
            notifications={groupedNotifications.yesterday}
            actionLoadingId={actionLoadingId}
            onRead={(item) => void handleNotificationRead(item)}
            onDelete={(item) => void handleNotificationDelete(item)}
          />
          <NotificationGroup
            group="older"
            notifications={groupedNotifications.older}
            actionLoadingId={actionLoadingId}
            onRead={(item) => void handleNotificationRead(item)}
            onDelete={(item) => void handleNotificationDelete(item)}
          />
        </div>
      )}

      {nextCursor ? (
        <div className="flex justify-center">
          <Button variant="secondary" disabled={loadingMore} onClick={() => void handleLoadMore()}>
            {loadingMore ? t("common.loading") : t("common.loadMore")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
