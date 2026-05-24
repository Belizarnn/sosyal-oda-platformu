export type NotificationType =
  | "FRIEND_REQUEST"
  | "FRIEND_ACCEPTED"
  | "DM_MESSAGE"
  | "ROOM_INVITE"
  | "ROOM_MODERATION"
  | "SYSTEM";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  metadata: Record<string, string> | null;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  nextCursor?: string | null;
}

export type NotificationFilterId =
  | "all"
  | "unread"
  | "friends"
  | "messages"
  | "rooms"
  | "system";

export interface NotificationsQuery {
  limit?: number;
  unreadOnly?: boolean;
  type?: NotificationType;
  types?: string;
  cursor?: string;
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "FRIEND_REQUEST":
      return "👥";
    case "FRIEND_ACCEPTED":
      return "✅";
    case "DM_MESSAGE":
      return "💬";
    case "ROOM_INVITE":
      return "🔗";
    case "ROOM_MODERATION":
      return "🛡️";
    case "SYSTEM":
    default:
      return "🔔";
  }
}

export function getNotificationActionLink(notification: Notification): string | null {
  if (notification.link) {
    return notification.link;
  }

  switch (notification.type) {
    case "FRIEND_REQUEST":
    case "FRIEND_ACCEPTED":
      return "/friends";
    case "DM_MESSAGE":
      return notification.metadata?.conversationId
        ? `/messages/${notification.metadata.conversationId}`
        : "/messages";
    case "ROOM_MODERATION":
      return notification.metadata?.roomId
        ? `/rooms/${notification.metadata.roomId}`
        : "/dashboard";
    case "ROOM_INVITE":
      return notification.metadata?.roomId
        ? `/rooms/${notification.metadata.roomId}`
        : "/rooms";
    default:
      return null;
  }
}

export function filterToQuery(
  filter: NotificationFilterId,
): NotificationsQuery {
  switch (filter) {
    case "unread":
      return { unreadOnly: true };
    case "friends":
      return { types: "FRIEND_REQUEST,FRIEND_ACCEPTED" };
    case "messages":
      return { type: "DM_MESSAGE" };
    case "rooms":
      return { types: "ROOM_INVITE,ROOM_MODERATION" };
    case "system":
      return { type: "SYSTEM" };
    default:
      return {};
  }
}
