"use client";

import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useLanguage } from "@/contexts/LanguageContext";
import type { NotificationDateGroup } from "@/lib/groupNotifications";
import type { Notification } from "@/types/notification";

interface NotificationGroupProps {
  group: NotificationDateGroup;
  notifications: Notification[];
  actionLoadingId?: string | null;
  onRead: (notification: Notification) => void;
  onDelete: (notification: Notification) => void;
}

export function NotificationGroup({
  group,
  notifications,
  actionLoadingId,
  onRead,
  onDelete,
}: NotificationGroupProps) {
  const { t } = useLanguage();

  if (notifications.length === 0) {
    return null;
  }

  const titleKey =
    group === "today"
      ? "notifications.groups.today"
      : group === "yesterday"
        ? "notifications.groups.yesterday"
        : "notifications.groups.older";

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {t(titleKey)}
      </h2>
      <div className="space-y-2">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            actionLoading={actionLoadingId === notification.id}
            onRead={onRead}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}
