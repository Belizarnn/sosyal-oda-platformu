import type { Server } from "socket.io";
import { AppError } from "../utils/asyncHandler";
import { assertMessageThrottle } from "../utils/socketMessageThrottle";
import {
  roomJoinPayloadSchema,
  roomLeavePayloadSchema,
  sendMessageSchema,
  typingPayloadSchema,
} from "../modules/messages/message.schemas";
import * as messageService from "../modules/messages/message.service";
import { assertActiveRoomMember } from "../modules/rooms/room.service";
import {
  addUserToActiveRoom,
  getUserCurrentRoom,
  removeUserCurrentRoom,
  removeUserFromActiveRoom,
  setUserCurrentRoom,
} from "../services/presenceCache.service";
import {
  type AuthenticatedSocket,
  getSocketRoomName,
} from "./types";

function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Bir hata oluştu";
}

export function registerChatHandlers(io: Server): void {
  io.on("connection", (socket: AuthenticatedSocket) => {
    const joinedRooms = new Set<string>();
    const user = socket.data.user;

    if (process.env.NODE_ENV !== "production") {
      console.log(`Socket bağlandı: ${socket.id} (@${user.handle})`);
    }

    const emitUserLeft = (roomId: string) => {
      socket.to(getSocketRoomName(roomId)).emit("user:left", {
        roomId,
        user: {
          id: user.id,
          username: user.username,
          handle: user.handle,
        },
      });
    };

    socket.on("room:join", async (payload, callback) => {
      try {
        const input = roomJoinPayloadSchema.parse(payload);
        await assertActiveRoomMember(socket.data.userId, input.roomId);

        const roomName = getSocketRoomName(input.roomId);
        await socket.join(roomName);

        if (!joinedRooms.has(input.roomId)) {
          joinedRooms.add(input.roomId);
          socket.to(roomName).emit("user:joined", {
            roomId: input.roomId,
            user: {
              id: user.id,
              username: user.username,
              handle: user.handle,
            },
          });
        }

        await setUserCurrentRoom(socket.data.userId, input.roomId);
        await addUserToActiveRoom(input.roomId, socket.data.userId, socket.id);

        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: getErrorMessage(error) });
      }
    });

    socket.on("room:leave", async (payload, callback) => {
      try {
        const input = roomLeavePayloadSchema.parse(payload);
        const roomName = getSocketRoomName(input.roomId);

        if (joinedRooms.has(input.roomId)) {
          await socket.leave(roomName);
          joinedRooms.delete(input.roomId);
          emitUserLeft(input.roomId);
          await removeUserFromActiveRoom(
            input.roomId,
            socket.data.userId,
            socket.id,
          );

          const currentRoom = await getUserCurrentRoom(socket.data.userId);

          if (currentRoom === input.roomId) {
            await removeUserCurrentRoom(socket.data.userId);
          }
        }

        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: getErrorMessage(error) });
      }
    });

    socket.on("message:send", async (payload, callback) => {
      try {
        const input = sendMessageSchema.parse(payload);

        if (!joinedRooms.has(input.roomId)) {
          callback?.({
            ok: false,
            message: "Mesaj göndermek için önce oda kanalına katılmalısın.",
          });
          return;
        }

        assertMessageThrottle(socket);

        const message = await messageService.createRoomMessage(
          input.roomId,
          socket.data.userId,
          input.content,
          input.replyToMessageId,
        );

        io.to(getSocketRoomName(input.roomId)).emit("message:new", message);
        callback?.({ ok: true, message });
      } catch (error) {
        callback?.({ ok: false, message: getErrorMessage(error) });
      }
    });

    socket.on("typing:start", (payload) => {
      try {
        const input = typingPayloadSchema.parse(payload);

        if (!joinedRooms.has(input.roomId)) {
          return;
        }

        socket.to(getSocketRoomName(input.roomId)).emit("typing:update", {
          roomId: input.roomId,
          user: {
            id: user.id,
            username: user.username,
            handle: user.handle,
          },
          isTyping: true,
        });
      } catch {
        // Typing eventleri sessizce yoksayılır
      }
    });

    socket.on("typing:stop", (payload) => {
      try {
        const input = typingPayloadSchema.parse(payload);

        if (!joinedRooms.has(input.roomId)) {
          return;
        }

        socket.to(getSocketRoomName(input.roomId)).emit("typing:update", {
          roomId: input.roomId,
          user: {
            id: user.id,
            username: user.username,
            handle: user.handle,
          },
          isTyping: false,
        });
      } catch {
        // Typing eventleri sessizce yoksayılır
      }
    });

    socket.on("disconnect", async () => {
      for (const roomId of joinedRooms) {
        emitUserLeft(roomId);
        await removeUserFromActiveRoom(roomId, socket.data.userId, socket.id);

        const currentRoom = await getUserCurrentRoom(socket.data.userId);

        if (currentRoom === roomId) {
          await removeUserCurrentRoom(socket.data.userId);
        }
      }

      joinedRooms.clear();

      if (process.env.NODE_ENV !== "production") {
        console.log(`Socket ayrıldı: ${socket.id}`);
      }
    });
  });
}
