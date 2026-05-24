import { io, type Socket } from "socket.io-client";
import { API_BASE_URL } from "./api";
import type {
  DmMessageDeletedEvent,
  DmTypingUpdateEvent,
  DirectMessage,
} from "@/types/dm";
import type { Notification } from "@/types/notification";
import type {
  ChatMessage,
  SocketUserEvent,
  TypingUpdateEvent,
} from "@/types/message";
import type {
  RoomMediaState,
  SetWatchMediaInput,
  WatchCountdownStartedPayload,
  WatchErrorPayload,
  WatchQueueUpdatedPayload,
  WatchReadyUpdatedPayload,
  WatchReadyUser,
  WatchSyncPayload,
} from "@/types/watch";

export interface SocketAckResponse {
  ok: boolean;
  message?: string;
}

export interface WatchJoinAckResponse extends SocketAckResponse {
  mediaState?: RoomMediaState | null;
  readyUsers?: WatchReadyUser[];
  queue?: WatchQueueUpdatedPayload["queue"];
}

export interface WatchMediaAckResponse extends SocketAckResponse {
  mediaState?: RoomMediaState;
}

export interface WatchReadyAckResponse extends SocketAckResponse {
  readyUsers?: WatchReadyUser[];
}

export interface ServerToClientEvents {
  "message:new": (message: ChatMessage) => void;
  "user:joined": (payload: SocketUserEvent) => void;
  "user:left": (payload: SocketUserEvent) => void;
  "typing:update": (payload: TypingUpdateEvent) => void;
  "watch:state-updated": (mediaState: RoomMediaState) => void;
  "watch:queue-updated": (payload: WatchQueueUpdatedPayload) => void;
  "watch:ready-updated": (payload: WatchReadyUpdatedPayload) => void;
  "watch:countdown-started": (payload: WatchCountdownStartedPayload) => void;
  "watch:sync": (payload: WatchSyncPayload) => void;
  "watch:error": (payload: WatchErrorPayload) => void;
  "message:deleted": (payload: { roomId: string; messageId: string }) => void;
  "moderation:user-kicked": (payload: {
    roomId: string;
    userId: string;
  }) => void;
  "moderation:user-muted": (payload: {
    roomId: string;
    userId: string;
    mutedUntil?: string | null;
  }) => void;
  "moderation:user-banned": (payload: {
    roomId: string;
    userId: string;
  }) => void;
  "dm:message:new": (message: DirectMessage) => void;
  "dm:message:deleted": (payload: DmMessageDeletedEvent) => void;
  "dm:typing:update": (payload: DmTypingUpdateEvent) => void;
  "dm:error": (payload: { message: string }) => void;
  "notification:new": (notification: Notification) => void;
  "notification:unread-count-updated": (payload: { unreadCount: number }) => void;
}

export interface ClientToServerEvents {
  "room:join": (
    payload: { roomId: string },
    callback?: (response: SocketAckResponse) => void,
  ) => void;
  "room:leave": (
    payload: { roomId: string },
    callback?: (response: SocketAckResponse) => void,
  ) => void;
  "message:send": (
    payload: {
      roomId: string;
      content: string;
      replyToMessageId?: string | null;
    },
    callback?: (response: SocketAckResponse & { message?: ChatMessage }) => void,
  ) => void;
  "typing:start": (payload: { roomId: string }) => void;
  "typing:stop": (payload: { roomId: string }) => void;
  "watch:join": (
    payload: { roomId: string },
    callback?: (response: WatchJoinAckResponse) => void,
  ) => void;
  "watch:set-video": (
    payload: { roomId: string; videoUrl: string },
    callback?: (response: WatchMediaAckResponse) => void,
  ) => void;
  "watch:set-media": (
    payload: SetWatchMediaInput & { roomId: string },
    callback?: (response: WatchMediaAckResponse) => void,
  ) => void;
  "watch:ready": (
    payload: { roomId: string; isReady: boolean },
    callback?: (response: WatchReadyAckResponse) => void,
  ) => void;
  "watch:countdown-start": (
    payload: { roomId: string; seconds: 3 | 5 | 10 },
    callback?: (response: SocketAckResponse) => void,
  ) => void;
  "watch:play": (
    payload: { roomId: string; currentTime: number },
    callback?: (response: WatchMediaAckResponse) => void,
  ) => void;
  "watch:pause": (
    payload: { roomId: string; currentTime: number },
    callback?: (response: WatchMediaAckResponse) => void,
  ) => void;
  "watch:seek": (
    payload: { roomId: string; currentTime: number },
    callback?: (response: WatchMediaAckResponse) => void,
  ) => void;
  "watch:timer-sync": (
    payload: { roomId: string; currentTime: number; isPlaying: boolean },
    callback?: (response: SocketAckResponse) => void,
  ) => void;
  "dm:join": (
    payload: { conversationId: string },
    callback?: (response: SocketAckResponse) => void,
  ) => void;
  "dm:leave": (
    payload: { conversationId: string },
    callback?: (response: SocketAckResponse) => void,
  ) => void;
  "dm:message:send": (
    payload: { conversationId: string; content: string },
    callback?: (response: SocketAckResponse & { message?: DirectMessage }) => void,
  ) => void;
  "dm:typing:start": (payload: { conversationId: string }) => void;
  "dm:typing:stop": (payload: { conversationId: string }) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: AppSocket | null = null;

export function createSocket(token: string): AppSocket {
  if (
    socketInstance &&
    (socketInstance.auth as { token?: string } | undefined)?.token === token
  ) {
    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = io(API_BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return socketInstance;
}

export function getSocket(): AppSocket | null {
  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
