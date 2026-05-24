import { NotificationType } from "@prisma/client";

import { z } from "zod";



const notificationTypeSchema = z.enum([

  "FRIEND_REQUEST",

  "FRIEND_ACCEPTED",

  "DM_MESSAGE",

  "ROOM_INVITE",

  "ROOM_MODERATION",

  "SYSTEM",

]);



export const listNotificationsQuerySchema = z.object({

  limit: z.coerce.number().int().min(1).max(50).default(20),

  unreadOnly: z

    .enum(["true", "false"])

    .optional()

    .transform((value) => value === "true"),

  type: notificationTypeSchema.optional(),

  types: z

    .string()

    .optional()

    .transform((value) =>

      value

        ? value

            .split(",")

            .map((item) => item.trim())

            .filter(Boolean)

        : undefined,

    ),

  cursor: z.string().min(1).optional(),

});



export const updateNotificationPreferencesSchema = z.object({

  notifyFriendRequests: z.boolean().optional(),

  notifyFriendAccepted: z.boolean().optional(),

  notifyDmMessages: z.boolean().optional(),

  notifyRoomModeration: z.boolean().optional(),

  notifyRoomActivity: z.boolean().optional(),

  notifySystem: z.boolean().optional(),

});



export const deleteNotificationsSchema = z.object({

  onlyRead: z.boolean().optional(),

});



export type ListNotificationsQuery = {

  limit: number;

  unreadOnly?: boolean;

  type?: NotificationType;

  types?: NotificationType[];

  cursor?: string;

};



export type UpdateNotificationPreferencesInput = z.infer<

  typeof updateNotificationPreferencesSchema

>;



export type DeleteNotificationsInput = z.infer<typeof deleteNotificationsSchema>;



export function parseListNotificationsQuery(

  query: z.infer<typeof listNotificationsQuerySchema>,

): ListNotificationsQuery {

  const types = [

    ...(query.type ? [query.type] : []),

    ...((query.types ?? []) as NotificationType[]),

  ];



  const uniqueTypes = [...new Set(types)];



  return {

    limit: query.limit,

    unreadOnly: query.unreadOnly,

    types: uniqueTypes.length > 0 ? uniqueTypes : undefined,

    cursor: query.cursor,

  };

}


