"use client";

import { useEffect, useState } from "react";
import { NotificationEmptyState, NotificationFooterLink, NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Notification } from "@/types/notification";

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onRefresh: () => Promise<void>;
  onMarkAllRead: () => Promise<void>;
  onNotificationRead: (notification: Notification) => Promise<void>;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  onRefresh,
  onMarkAllRead,
  onNotificationRead,
  onClose,
}: NotificationDropdownProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    void onRefresh().finally(() => setLoading(false));
  }, [onRefresh]);

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border bg-dropdown/95 shadow-[0_0_40px_var(--glow)] backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{t("notifications.title")}</p>
          <p className="text-xs text-muted">
            {t("notifications.unread", { count: unreadCount })}
          </p>
        </div>
        {unreadCount > 0 ? (
          <Button
            variant="ghost"
            className="px-3 py-1.5 text-xs"
            onClick={() => void onMarkAllRead()}
          >
            {t("notifications.markAllRead")}
          </Button>
        ) : null}
      </div>

      <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-xl bg-surface" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <NotificationEmptyState compact />
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              compact
              onRead={(item) => {
                void onNotificationRead(item);
                onClose();
              }}
            />
          ))
        )}
      </div>

      <div className="border-t border-border p-2">
        <NotificationFooterLink />
      </div>
    </div>
  );
}
