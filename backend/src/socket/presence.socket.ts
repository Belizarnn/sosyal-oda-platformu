import type { Server } from "socket.io";
import {
  removeUserCurrentRoom,
  removeUserSocket,
  setUserOnline,
} from "../services/presenceCache.service";
import { type AuthenticatedSocket, getUserSocketRoomName } from "./types";

export function registerPresenceHandlers(io: Server): void {
  io.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.data.userId;

    void (async () => {
      await socket.join(getUserSocketRoomName(userId));
      await setUserOnline(userId, socket.id);
    })();

    socket.on("disconnect", () => {
      void (async () => {
        const stillOnline = await removeUserSocket(userId, socket.id);

        if (!stillOnline) {
          await removeUserCurrentRoom(userId);
        }
      })();
    });
  });
}
