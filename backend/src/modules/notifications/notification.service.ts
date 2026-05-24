import { NotificationType, type Notification, type Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

import { getIO } from "../../socket/socket";

import { getUserSocketRoomName } from "../../socket/types";

import { AppError } from "../../utils/asyncHandler";

import type {

  DeleteNotificationsInput,

  ListNotificationsQuery,

  UpdateNotificationPreferencesInput,

} from "./notification.schemas";



export interface CreateNotificationInput {

  userId: string;

  type: NotificationType;

  title: string;

  body?: string | null;

  link?: string | null;

  metadata?: Prisma.InputJsonValue;

}



export type NotificationPreferences = {

  notifyFriendRequests: boolean;

  notifyFriendAccepted: boolean;

  notifyDmMessages: boolean;

  notifyRoomModeration: boolean;

  notifyRoomActivity: boolean;

  notifySystem: boolean;

};



const PREFERENCE_SELECT = {

  notifyFriendRequests: true,

  notifyFriendAccepted: true,

  notifyDmMessages: true,

  notifyRoomModeration: true,

  notifyRoomActivity: true,

  notifySystem: true,

} as const;



const METADATA_ALLOWLIST = [

  "conversationId",

  "messageId",

  "roomId",

  "requestId",

] as const;



function sanitizeMetadata(metadata: unknown): Record<string, string> | null {

  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {

    return null;

  }



  const source = metadata as Record<string, unknown>;

  const sanitized: Record<string, string> = {};



  for (const key of METADATA_ALLOWLIST) {

    const value = source[key];



    if (typeof value === "string" && value.trim()) {

      sanitized[key] = value;

    }

  }



  return Object.keys(sanitized).length > 0 ? sanitized : null;

}



export function formatNotification(notification: Notification) {

  return {

    id: notification.id,

    userId: notification.userId,

    type: notification.type,

    title: notification.title,

    body: notification.body,

    link: notification.link,

    isRead: notification.isRead,

    metadata: sanitizeMetadata(notification.metadata),

    createdAt: notification.createdAt.toISOString(),

    readAt: notification.readAt?.toISOString() ?? null,

  };

}



function formatPreferences(user: NotificationPreferences): NotificationPreferences {

  return {

    notifyFriendRequests: user.notifyFriendRequests,

    notifyFriendAccepted: user.notifyFriendAccepted,

    notifyDmMessages: user.notifyDmMessages,

    notifyRoomModeration: user.notifyRoomModeration,

    notifyRoomActivity: user.notifyRoomActivity,

    notifySystem: user.notifySystem,

  };

}



export async function getUnreadCount(userId: string) {

  return prisma.notification.count({

    where: {

      userId,

      isRead: false,

    },

  });

}



function emitNotificationNew(

  userId: string,

  notification: ReturnType<typeof formatNotification>,

) {

  const io = getIO();



  if (!io) {

    return;

  }



  io.to(getUserSocketRoomName(userId)).emit("notification:new", notification);

}



export async function emitUnreadCountUpdated(userId: string) {

  const io = getIO();



  if (!io) {

    return;

  }



  const unreadCount = await getUnreadCount(userId);

  io.to(getUserSocketRoomName(userId)).emit("notification:unread-count-updated", {

    unreadCount,

  });

}



export async function shouldCreateNotification(

  userId: string,

  type: NotificationType,

): Promise<boolean> {

  const user = await prisma.user.findUnique({

    where: { id: userId },

    select: PREFERENCE_SELECT,

  });



  if (!user) {

    return false;

  }



  switch (type) {

    case NotificationType.FRIEND_REQUEST:

      return user.notifyFriendRequests;

    case NotificationType.FRIEND_ACCEPTED:

      return user.notifyFriendAccepted;

    case NotificationType.DM_MESSAGE:

      return user.notifyDmMessages;

    case NotificationType.ROOM_MODERATION:

      return user.notifyRoomModeration;

    case NotificationType.ROOM_INVITE:

      return user.notifyRoomActivity;

    case NotificationType.SYSTEM:

      return user.notifySystem;

    default:

      return true;

  }

}



export async function createNotification(input: CreateNotificationInput) {

  const allowed = await shouldCreateNotification(input.userId, input.type);



  if (!allowed) {

    return null;

  }



  const title = input.title.trim();



  if (!title) {

    throw new Error("Bildirim başlığı boş olamaz");

  }



  const notification = await prisma.notification.create({

    data: {

      userId: input.userId,

      type: input.type,

      title,

      body: input.body?.trim() || null,

      link: input.link ?? null,

      metadata: input.metadata ?? undefined,

    },

  });



  const formatted = formatNotification(notification);

  emitNotificationNew(input.userId, formatted);

  await emitUnreadCountUpdated(input.userId);



  return formatted;

}



function buildTypeFilter(types?: NotificationType[]) {

  if (!types || types.length === 0) {

    return undefined;

  }



  return types.length === 1 ? types[0] : { in: types };

}



export async function listNotifications(

  userId: string,

  query: ListNotificationsQuery,

) {

  const cursorNotification = query.cursor

    ? await prisma.notification.findFirst({

        where: {

          id: query.cursor,

          userId,

        },

      })

    : null;



  const notifications = await prisma.notification.findMany({

    where: {

      userId,

      ...(query.unreadOnly ? { isRead: false } : {}),

      ...(query.types?.length

        ? { type: buildTypeFilter(query.types) }

        : {}),

      ...(cursorNotification

        ? {

            OR: [

              { createdAt: { lt: cursorNotification.createdAt } },

              {

                createdAt: cursorNotification.createdAt,

                id: { lt: cursorNotification.id },

              },

            ],

          }

        : {}),

    },

    orderBy: [{ createdAt: "desc" }, { id: "desc" }],

    take: query.limit,

  });



  const unreadCount = await getUnreadCount(userId);

  const nextCursor =

    notifications.length === query.limit

      ? notifications[notifications.length - 1]?.id ?? null

      : null;



  return {

    notifications: notifications.map(formatNotification),

    unreadCount,

    nextCursor,

  };

}



export async function getNotificationPreferences(userId: string) {

  const user = await prisma.user.findUnique({

    where: { id: userId },

    select: PREFERENCE_SELECT,

  });



  if (!user) {

    throw new AppError(404, "Kullanıcı bulunamadı");

  }



  return {

    preferences: formatPreferences(user),

  };

}



export async function updateNotificationPreferences(

  userId: string,

  input: UpdateNotificationPreferencesInput,

) {

  const user = await prisma.user.update({

    where: { id: userId },

    data: {

      ...(input.notifyFriendRequests !== undefined

        ? { notifyFriendRequests: input.notifyFriendRequests }

        : {}),

      ...(input.notifyFriendAccepted !== undefined

        ? { notifyFriendAccepted: input.notifyFriendAccepted }

        : {}),

      ...(input.notifyDmMessages !== undefined

        ? { notifyDmMessages: input.notifyDmMessages }

        : {}),

      ...(input.notifyRoomModeration !== undefined

        ? { notifyRoomModeration: input.notifyRoomModeration }

        : {}),

      ...(input.notifyRoomActivity !== undefined

        ? { notifyRoomActivity: input.notifyRoomActivity }

        : {}),

      ...(input.notifySystem !== undefined

        ? { notifySystem: input.notifySystem }

        : {}),

    },

    select: PREFERENCE_SELECT,

  });



  return {

    preferences: formatPreferences(user),

  };

}



export async function markNotificationAsRead(

  userId: string,

  notificationId: string,

) {

  const notification = await prisma.notification.findFirst({

    where: {

      id: notificationId,

      userId,

    },

  });



  if (!notification) {

    return null;

  }



  if (notification.isRead) {

    return formatNotification(notification);

  }



  const updated = await prisma.notification.update({

    where: { id: notificationId },

    data: {

      isRead: true,

      readAt: new Date(),

    },

  });



  await emitUnreadCountUpdated(userId);



  return formatNotification(updated);

}



export async function markAllNotificationsAsRead(userId: string) {

  const result = await prisma.notification.updateMany({

    where: {

      userId,

      isRead: false,

    },

    data: {

      isRead: true,

      readAt: new Date(),

    },

  });



  await emitUnreadCountUpdated(userId);



  return {

    updatedCount: result.count,

  };

}



export async function deleteNotification(userId: string, notificationId: string) {

  const notification = await prisma.notification.findFirst({

    where: {

      id: notificationId,

      userId,

    },

  });



  if (!notification) {

    throw new AppError(404, "Bildirim bulunamadı");

  }



  await prisma.notification.delete({

    where: { id: notificationId },

  });



  await emitUnreadCountUpdated(userId);



  return {

    message: "Bildirim silindi",

  };

}



export async function deleteNotifications(

  userId: string,

  input: DeleteNotificationsInput,

) {

  const result = await prisma.notification.deleteMany({

    where: {

      userId,

      ...(input.onlyRead ? { isRead: true } : {}),

    },

  });



  await emitUnreadCountUpdated(userId);



  return {

    deletedCount: result.count,

  };

}


