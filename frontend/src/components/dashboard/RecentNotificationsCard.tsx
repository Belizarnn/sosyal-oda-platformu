"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getNotificationIcon } from "@/types/notification";
import type { Notification } from "@/types/notification";

interface RecentNotificationsCardProps {
  notifications: Notification[];
}

export function RecentNotificationsCard({ notifications }: RecentNotificationsCardProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("dashboard.notifications.title")}</h2>
        <Link href="/notifications" className="text-sm text-accent hover:underline">
          {t("notifications.viewAll")}
        </Link>
      </div>
      <Card className="divide-y divide-border">
        {notifications.length === 0 ? (
          <p className="p-5 text-sm text-muted">{t("dashboard.notifications.empty")}</p>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link ?? "/notifications"}
              className="flex items-start gap-3 p-4 transition hover:bg-surface-hover"
            >
              <span className="text-lg" aria-hidden>
                {getNotificationIcon(notification.type)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{notification.title}</p>
                {notification.body ? (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted">{notification.body}</p>
                ) : null}
              </div>
              {!notification.isRead ? (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
              ) : null}
            </Link>
          ))
        )}
      </Card>
    </section>
  );
}
