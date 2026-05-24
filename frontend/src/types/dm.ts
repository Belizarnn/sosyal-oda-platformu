import type { PresenceStatus } from "@/lib/api";

export interface DMParticipant {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  presenceStatus: PresenceStatus;
  statusMessage?: string | null;
  lastSeenAt?: string | null;
}

export interface DMLastMessage {
  id: string;
  content: string;
  createdAt: string;
}

export interface DMConversation {
  id: string;
  type: "DIRECT";
  otherUser: DMParticipant;
  lastMessage: DMLastMessage | null;
  updatedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender: {
    id: string;
    username: string;
    handle: string;
    avatarUrl: string | null;
  };
}

export interface StartDirectConversationInput {
  userId?: string;
  handle?: string;
}

export interface DmTypingUpdateEvent {
  conversationId: string;
  user: {
    id: string;
    username: string;
    handle: string;
  };
  isTyping: boolean;
}

export interface DmMessageDeletedEvent {
  conversationId: string;
  messageId: string;
}

export interface DmSocketAckResponse {
  ok: boolean;
  message?: string | DirectMessage;
}
