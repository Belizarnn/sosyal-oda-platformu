import type { Server } from "socket.io";

export function registerNotificationHandlers(_io: Server): void {
  // notification:new ve unread-count eventleri notification.service içinden
  // user:{userId} odasına gönderilir. Oda katılımı presence.socket.ts'te yapılır.
}
