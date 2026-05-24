import type { Socket } from "socket.io";
import type { SocketUserPayload } from "../utils/sanitizeMessage";

export interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    user: SocketUserPayload;
    messageThrottle?: {
      lastMessageAt: number;
      recentTimestamps: number[];
    };
  };
}

export function getSocketRoomName(roomId: string): string {
  return `room:${roomId}`;
}

export function getDmSocketRoomName(conversationId: string): string {
  return `dm:${conversationId}`;
}

export function getUserSocketRoomName(userId: string): string {
  return `user:${userId}`;
}
