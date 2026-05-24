export interface MessageSender {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  presenceStatus?: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  content: string;
  replyToMessageId?: string | null;
  createdAt: string;
  sender: MessageSender;
}

export interface PaginatedMessagesResponse {
  messages: ChatMessage[];
  nextCursor: string | null;
}

export interface SendMessageInput {
  roomId: string;
  content: string;
  replyToMessageId?: string | null;
}

export interface TypingUser {
  id: string;
  username: string;
  handle: string;
}

export interface ChatSystemEvent {
  id: string;
  type: "joined" | "left";
  roomId: string;
  user: {
    id: string;
    username: string;
    handle: string;
  };
  createdAt: string;
}

export interface SocketUserEvent {
  roomId: string;
  user: {
    id: string;
    username: string;
    handle: string;
  };
}

export interface TypingUpdateEvent {
  roomId: string;
  user: TypingUser;
  isTyping: boolean;
}

export type ChatTimelineItem =
  | { kind: "message"; data: ChatMessage }
  | { kind: "system"; data: ChatSystemEvent };
