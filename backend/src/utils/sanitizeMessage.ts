import type { Message, User } from "@prisma/client";
import type { PublicUserFields } from "./prismaSelects";

export interface MessageSenderPayload {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  presenceStatus: User["presenceStatus"];
}

export interface MessagePayload {
  id: string;
  roomId: string;
  content: string;
  replyToMessageId: string | null;
  createdAt: Date;
  sender: MessageSenderPayload;
}

export function sanitizeMessageSender(user: PublicUserFields): MessageSenderPayload {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    presenceStatus: user.presenceStatus,
  };
}

export function formatMessage(
  message: Message & { sender: PublicUserFields },
): MessagePayload {  return {
    id: message.id,
    roomId: message.roomId,
    content: message.content,
    replyToMessageId: message.replyToMessageId,
    createdAt: message.createdAt,
    sender: sanitizeMessageSender(message.sender),
  };
}

export interface SocketUserPayload {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
}

export function toSocketUser(user: User): SocketUserPayload {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
  };
}
