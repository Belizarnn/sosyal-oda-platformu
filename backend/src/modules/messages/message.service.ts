import { prisma } from "../../lib/prisma";

import { trackServerEvent } from "../../lib/analytics";

import { AppError } from "../../utils/asyncHandler";

import { formatMessage } from "../../utils/sanitizeMessage";

import { trimAndLimit } from "../../utils/sanitizeInput";

import {

  buildOlderThanCursorFilter,

  DEFAULT_MESSAGE_LIMIT,

  MAX_MESSAGE_LIMIT,

  resolveOlderMessageCursor,

  clampLimit,

} from "../../utils/pagination";

import { messageSenderSelect } from "../../utils/prismaSelects";

import {

  assertActiveRoomMember,

  assertRoomExists,

} from "../rooms/room.service";

import { assertCanSendMessage } from "../../utils/permissions";

import type { ListMessagesQuery } from "./message.schemas";



export async function getRoomMessages(

  roomId: string,

  userId: string,

  query: ListMessagesQuery,

) {

  await assertRoomExists(roomId);

  await assertActiveRoomMember(userId, roomId);



  const limit = clampLimit(query.limit, DEFAULT_MESSAGE_LIMIT, MAX_MESSAGE_LIMIT);

  const beforeMessage = query.before

    ? await prisma.message.findFirst({

        where: {

          id: query.before,

          roomId,

          deletedAt: null,

        },

        select: {

          id: true,

          createdAt: true,

        },

      })

    : null;



  if (query.before && !beforeMessage) {

    throw new AppError(400, "Geçersiz mesaj cursor'u");

  }



  const batch = await prisma.message.findMany({

    where: {

      roomId,

      deletedAt: null,

      ...buildOlderThanCursorFilter(beforeMessage),

    },

    include: {

      sender: {

        select: messageSenderSelect,

      },

    },

    orderBy: [{ createdAt: "desc" }, { id: "desc" }],

    take: limit + 1,

  });



  const hasMore = batch.length > limit;

  const pageDesc = hasMore ? batch.slice(0, limit) : batch;

  const messages = pageDesc.reverse().map(formatMessage);

  const nextCursor = resolveOlderMessageCursor(messages, hasMore);



  return {

    messages,

    nextCursor,

  };

}



export async function createRoomMessage(

  roomId: string,

  userId: string,

  content: string,

  replyToMessageId?: string | null,

) {

  await assertCanSendMessage(userId, roomId);



  if (replyToMessageId) {

    const replyTarget = await prisma.message.findFirst({

      where: {

        id: replyToMessageId,

        roomId,

        deletedAt: null,

      },

    });



    if (!replyTarget) {

      throw new AppError(400, "Yanıtlanacak mesaj bulunamadı");

    }

  }



  const sanitizedContent = trimAndLimit(content, 1000);



  if (!sanitizedContent) {

    throw new AppError(400, "Mesaj boş olamaz");

  }



  const message = await prisma.message.create({

    data: {

      roomId,

      senderId: userId,

      content: sanitizedContent,

      replyToMessageId: replyToMessageId ?? null,

    },

    include: {

      sender: {

        select: messageSenderSelect,

      },

    },

  });



  void trackServerEvent({
    eventName: "message_sent",
    userId,
    properties: {
      roomId,
      hasReply: Boolean(replyToMessageId),
    },
  });

  return formatMessage(message);
}

