"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import { createSocket, getSocket } from "@/lib/socket";
import type { Notification } from "@/types/notification";

export function useNotifications(enabled: boolean) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!enabled || !getToken()) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.unreadCount);
    } catch {
      setUnreadCount(0);
    }
  }, [enabled]);

  const refreshNotifications = useCallback(async () => {
    if (!enabled || !getToken()) {
      setNotifications([]);
      return;
    }

    const response = await getNotifications({ limit: 8 });
    setNotifications(response.notifications);
    setUnreadCount(response.unreadCount);
  }, [enabled]);

  useEffect(() => {
    void refreshUnreadCount();
  }, [refreshUnreadCount]);

  useEffect(() => {
    if (!enabled || !getToken()) {
      return;
    }

    const token = getToken();
    if (!token) {
      return;
    }

    const socket = getSocket() ?? createSocket(token);

    function handleNewNotification(notification: Notification) {
      setNotifications((current) => {
        const filtered = current.filter((item) => item.id !== notification.id);
        return [notification, ...filtered].slice(0, 8);
      });
    }

    function handleUnreadCountUpdated(payload: { unreadCount: number }) {
      setUnreadCount(payload.unreadCount);
    }

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:unread-count-updated", handleUnreadCountUpdated);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:unread-count-updated", handleUnreadCountUpdated);
    };
  }, [enabled]);

  const markAsRead = useCallback(async (notification: Notification) => {
    if (notification.isRead) {
      return;
    }

    await markNotificationAsRead(notification.id);
    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, isRead: true, readAt: new Date().toISOString() }
          : item,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
    await refreshUnreadCount();
  }, [refreshUnreadCount]);

  const markAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    setNotifications((current) =>
      current.map((item) => ({
        ...item,
        isRead: true,
        readAt: item.readAt ?? new Date().toISOString(),
      })),
    );
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}

export function NotificationBell() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const enabled = Boolean(getToken());
  const {
    notifications,
    unreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications(enabled);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  if (!enabled) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-xl border border-border bg-surface p-2.5 text-muted transition hover:text-foreground"
        aria-label={t("notifications.bellAria")}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          onRefresh={refreshNotifications}
          onMarkAllRead={markAllAsRead}
          onNotificationRead={markAsRead}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
