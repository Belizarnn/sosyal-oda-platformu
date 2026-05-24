import type { Notification } from "@/types/notification";

export type NotificationDateGroup = "today" | "yesterday" | "older";

export function getNotificationDateGroup(createdAt: string): NotificationDateGroup {
  const date = new Date(createdAt);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return "today";
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) {
    return "yesterday";
  }

  return "older";
}

export function groupNotificationsByDate(
  notifications: Notification[],
): Record<NotificationDateGroup, Notification[]> {
  return notifications.reduce<Record<NotificationDateGroup, Notification[]>>(
    (groups, notification) => {
      const group = getNotificationDateGroup(notification.createdAt);
      groups[group].push(notification);
      return groups;
    },
    {
      today: [],
      yesterday: [],
      older: [],
    },
  );
}
