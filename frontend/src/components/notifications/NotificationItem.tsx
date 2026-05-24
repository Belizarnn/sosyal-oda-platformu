"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatRelativeTime } from "@/lib/formatDate";
import { cn } from "@/lib/cn";
import {
  getNotificationActionLink,
  getNotificationIcon,
  type Notification,
} from "@/types/notification";

interface NotificationItemProps {
  notification: Notification;
  actionLoading?: boolean;
  onRead?: (notification: Notification) => void;
  onDelete?: (notification: Notification) => void;
  compact?: boolean;
}

export function NotificationItem({
  notification,
  actionLoading = false,
  onRead,
  onDelete,
  compact = false,
}: NotificationItemProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const actionLink = getNotificationActionLink(notification);

  function handleGo() {
    if (!notification.isRead) {
      onRead?.(notification);
    }

    if (actionLink) {
      router.push(actionLink);
    }
  }

  function handleItemClick() {
    if (!compact) {
      return;
    }

    if (!notification.isRead) {
      onRead?.(notification);
    }

    if (actionLink) {
      router.push(actionLink);
    }
  }

  return (
    <div
      role={compact ? "button" : undefined}
      tabIndex={compact ? 0 : undefined}
      onClick={compact ? handleItemClick : undefined}
      onKeyDown={
        compact
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleItemClick();
              }
            }
          : undefined
      }
      className={cn(
        "rounded-xl border px-3 py-3 transition",
        notification.isRead
          ? "border-border bg-transparent"
          : "border-accent/20 bg-accent/[0.06]",
        compact && "cursor-pointer px-2 py-2 hover:bg-surface/60",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-lg">{getNotificationIcon(notification.type)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">{notification.title}</p>
            {!notification.isRead ? (
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
            ) : null}
          </div>
          {notification.body ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{notification.body}</p>
          ) : null}
          <p className="mt-2 text-xs text-muted/80">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </div>

      {!compact ? (
        <div className="mt-3 flex flex-wrap gap-2 pl-8">
          {!notification.isRead ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={actionLoading}
              onClick={() => onRead?.(notification)}
            >
              {t("notifications.markRead")}
            </Button>
          ) : null}
          {actionLink ? (
            <Button size="sm" disabled={actionLoading} onClick={handleGo}>
              {t("notifications.go")}
            </Button>
          ) : null}
          {onDelete ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={actionLoading}
              onClick={() => onDelete(notification)}
            >
              {t("notifications.delete")}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function NotificationEmptyState({ compact = false }: { compact?: boolean }) {
  const { t } = useLanguage();

  return (
    <div className={cn("py-8 text-center text-sm text-muted", compact && "py-6")}>
      {t("notifications.emptyCenter")}
    </div>
  );
}

export function NotificationFooterLink() {
  const { t } = useLanguage();

  return (
    <Link
      href="/notifications"
      className="block rounded-xl px-3 py-2 text-center text-sm text-accent hover:bg-surface"
    >
      {t("notifications.viewAll")}
    </Link>
  );
}
