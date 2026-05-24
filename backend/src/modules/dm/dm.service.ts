import {
  ConversationType,
  NotificationType,
  type DirectMessage,
  type User,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { trackServerEvent } from "../../lib/analytics";
import { getIO } from "../../socket/socket";
import { getDmSocketRoomName } from "../../socket/types";
import { AppError } from "../../utils/asyncHandler";
import {
  buildOlderThanCursorFilter,
  clampLimit,
  DEFAULT_MESSAGE_LIMIT,
  MAX_MESSAGE_LIMIT,
  resolveOlderMessageCursor,
} from "../../utils/pagination";
import { messageSenderSelect, type PublicUserFields } from "../../utils/prismaSelects";
import { trimAndLimit } from "../../utils/sanitizeInput";
import { orderUserIds, sanitizeFriendUser } from "../friends/friend.service";
import { createNotification } from "../notifications/notification.service";
import type {
  ListDmMessagesQuery,
  SendDmMessageInput,
  StartDirectConversationInput,
} from "./dm.schemas";

type MessageWithSender = DirectMessage & { sender: PublicUserFields };

function sanitizeMessageSender(user: PublicUserFields) {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
  };
}

export function formatDirectMessage(message: MessageWithSender) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
    sender: sanitizeMessageSender(message.sender),
  };
}

async function findFriendship(userId1: string, userId2: string) {
  const [userAId, userBId] = orderUserIds(userId1, userId2);

  return prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });
}

export async function findDirectConversation(userId1: string, userId2: string) {
  const participations = await prisma.conversationParticipant.findMany({
    where: {
      userId: { in: [userId1, userId2] },
      conversation: { type: ConversationType.DIRECT },
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  const [orderedA, orderedB] = orderUserIds(userId1, userId2);

  for (const participation of participations) {
    const participantIds = participation.conversation.participants
      .map((item) => item.userId)
      .sort();

    if (
      participantIds.length === 2 &&
      participantIds[0] === orderedA &&
      participantIds[1] === orderedB
    ) {
      return participation.conversation;
    }
  }

  return null;
}

function getOtherUser(
  conversation: {
    participants: Array<{ userId: string; user: User }>;
  },
  userId: string,
) {
  const otherParticipant = conversation.participants.find(
    (participant) => participant.userId !== userId,
  );

  if (!otherParticipant) {
    throw new AppError(500, "Sohbet katılımcısı bulunamadı");
  }

  return sanitizeFriendUser(otherParticipant.user);
}

function formatConversationSummary(
  conversation: {
    id: string;
    type: ConversationType;
    updatedAt: Date;
    participants: Array<{ userId: string; user: User }>;
    messages: DirectMessage[];
  },
  userId: string,
) {
  const lastMessage = conversation.messages[0];

  return {
    id: conversation.id,
    type: conversation.type,
    otherUser: getOtherUser(conversation, userId),
    lastMessage: lastMessage
      ? {
          id: lastMessage.id,
          content: lastMessage.content,
          createdAt: lastMessage.createdAt.toISOString(),
        }
      : null,
    updatedAt: conversation.updatedAt.toISOString(),
  };
}

export async function assertConversationParticipant(
  userId: string,
  conversationId: string,
) {
  const participation = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  if (!participation) {
    throw new AppError(403, "Bu sohbete erişim yetkiniz yok");
  }

  return participation;
}

function emitDmMessageNew(message: ReturnType<typeof formatDirectMessage>) {
  const io = getIO();

  if (!io) {
    return;
  }

  io.to(getDmSocketRoomName(message.conversationId)).emit("dm:message:new", message);
}

function emitDmMessageDeleted(conversationId: string, messageId: string) {
  const io = getIO();

  if (!io) {
    return;
  }

  io.to(getDmSocketRoomName(conversationId)).emit("dm:message:deleted", {
    conversationId,
    messageId,
  });
}

export async function getConversations(userId: string) {
  const participations = await prisma.conversationParticipant.findMany({
    where: {
      userId,
      conversation: {
        type: ConversationType.DIRECT,
      },
    },
    include: {
      conversation: {
        include: {
          participants: {
            include: {
              user: true,
            },
          },
          messages: {
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      conversation: {
        updatedAt: "desc",
      },
    },
  });

  return {
    conversations: participations.map((participation) =>
      formatConversationSummary(participation.conversation, userId),
    ),
  };
}

export async function startDirectConversation(
  userId: string,
  input: StartDirectConversationInput,
) {
  let targetUser: User | null = null;

  if (input.userId) {
    targetUser = await prisma.user.findUnique({
      where: { id: input.userId },
    });
  } else if (input.handle) {
    targetUser = await prisma.user.findUnique({
      where: { handle: input.handle },
    });
  }

  if (!targetUser) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  if (targetUser.id === userId) {
    throw new AppError(400, "Kendinizle sohbet başlatamazsınız");
  }

  const friendship = await findFriendship(userId, targetUser.id);

  if (!friendship) {
    throw new AppError(403, "DM başlatmak için önce arkadaş olmalısınız.");
  }

  const existing = await findDirectConversation(userId, targetUser.id);

  if (existing) {
    return {
      conversation: formatConversationSummary(existing, userId),
    };
  }

  const conversation = await prisma.conversation.create({
    data: {
      type: ConversationType.DIRECT,
      participants: {
        create: [{ userId }, { userId: targetUser.id }],
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return {
    conversation: formatConversationSummary(conversation, userId),
  };
}

export async function getConversationMessages(
  userId: string,
  conversationId: string,
  query: ListDmMessagesQuery,
) {
  await assertConversationParticipant(userId, conversationId);

  const limit = clampLimit(query.limit, DEFAULT_MESSAGE_LIMIT, MAX_MESSAGE_LIMIT);
  const beforeMessage = query.before
    ? await prisma.directMessage.findFirst({
        where: {
          id: query.before,
          conversationId,
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

  const batch = await prisma.directMessage.findMany({
    where: {
      conversationId,
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
  const messages = pageDesc.reverse().map(formatDirectMessage);
  const nextCursor = resolveOlderMessageCursor(messages, hasMore);

  return {
    messages,
    nextCursor,
  };
}

export async function createDirectMessage(
  userId: string,
  conversationId: string,
  content: string,
) {
  await assertConversationParticipant(userId, conversationId);

  const sanitizedContent = trimAndLimit(content, 1000);

  if (!sanitizedContent) {
    throw new AppError(400, "Mesaj boş olamaz");
  }

  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.directMessage.create({
      data: {
        conversationId,
        senderId: userId,
        content: sanitizedContent,
      },
      include: {
        sender: {
          select: messageSenderSelect,
        },
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
      },
    });

    return created;
  });

  const formatted = formatDirectMessage(message);
  emitDmMessageNew(formatted);

  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true },
  });

  const preview =
    sanitizedContent.length > 80
      ? `${sanitizedContent.slice(0, 80)}...`
      : sanitizedContent;

  for (const participant of participants) {
    if (participant.userId === userId) {
      continue;
    }

    await createNotification({
      userId: participant.userId,
      type: NotificationType.DM_MESSAGE,
      title: "Yeni mesaj",
      body: `${message.sender.username}: ${preview}`,
      link: `/messages/${conversationId}`,
      metadata: {
        conversationId,
        messageId: message.id,
      },
    });
  }

  void trackServerEvent({
    eventName: "dm_sent",
    userId,
    properties: { conversationId },
  });

  return formatted;
}

export async function sendConversationMessage(
  userId: string,
  conversationId: string,
  input: SendDmMessageInput,
) {
  const message = await createDirectMessage(
    userId,
    conversationId,
    input.content,
  );

  return { message };
}

export async function deleteConversationMessage(
  userId: string,
  conversationId: string,
  messageId: string,
) {
  await assertConversationParticipant(userId, conversationId);

  const existingMessage = await prisma.directMessage.findFirst({
    where: {
      id: messageId,
      conversationId,
      deletedAt: null,
    },
  });

  if (!existingMessage) {
    throw new AppError(404, "Mesaj bulunamadı");
  }

  if (existingMessage.senderId !== userId) {
    throw new AppError(403, "Yalnızca kendi mesajınızı silebilirsiniz");
  }

  await prisma.directMessage.update({
    where: { id: messageId },
    data: {
      deletedAt: new Date(),
    },
  });

  emitDmMessageDeleted(conversationId, messageId);

  return {
    message: "Mesaj silindi",
  };
}
