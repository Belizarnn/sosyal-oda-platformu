import type { Server } from "socket.io";
import { AppError } from "../utils/asyncHandler";
import { assertMessageThrottle } from "../utils/socketMessageThrottle";
import {
  dmConversationPayloadSchema,
  dmMessageSendPayloadSchema,
} from "../modules/dm/dm.schemas";
import * as dmService from "../modules/dm/dm.service";
import { type AuthenticatedSocket, getDmSocketRoomName } from "./types";

function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Bir hata oluştu";
}

export function registerDmHandlers(io: Server): void {
  io.on("connection", (socket: AuthenticatedSocket) => {
    const joinedConversations = new Set<string>();
    const user = socket.data.user;

    socket.on("dm:join", async (payload, callback) => {
      try {
        const input = dmConversationPayloadSchema.parse(payload);
        await dmService.assertConversationParticipant(
          socket.data.userId,
          input.conversationId,
        );

        const roomName = getDmSocketRoomName(input.conversationId);
        await socket.join(roomName);
        joinedConversations.add(input.conversationId);

        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: getErrorMessage(error) });
      }
    });

    socket.on("dm:leave", async (payload, callback) => {
      try {
        const input = dmConversationPayloadSchema.parse(payload);
        const roomName = getDmSocketRoomName(input.conversationId);

        if (joinedConversations.has(input.conversationId)) {
          await socket.leave(roomName);
          joinedConversations.delete(input.conversationId);
        }

        callback?.({ ok: true });
      } catch (error) {
        callback?.({ ok: false, message: getErrorMessage(error) });
      }
    });

    socket.on("dm:message:send", async (payload, callback) => {
      try {
        const input = dmMessageSendPayloadSchema.parse(payload);

        if (!joinedConversations.has(input.conversationId)) {
          callback?.({
            ok: false,
            message: "Mesaj göndermek için önce konuşmaya katılmalısın.",
          });
          return;
        }

        assertMessageThrottle(socket);

        const message = await dmService.createDirectMessage(
          socket.data.userId,
          input.conversationId,
          input.content,
        );

        callback?.({ ok: true, message });
      } catch (error) {
        callback?.({ ok: false, message: getErrorMessage(error) });
      }
    });

    socket.on("dm:typing:start", async (payload) => {
      try {
        const input = dmConversationPayloadSchema.parse(payload);

        if (!joinedConversations.has(input.conversationId)) {
          return;
        }

        socket
          .to(getDmSocketRoomName(input.conversationId))
          .emit("dm:typing:update", {
            conversationId: input.conversationId,
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

    socket.on("dm:typing:stop", async (payload) => {
      try {
        const input = dmConversationPayloadSchema.parse(payload);

        if (!joinedConversations.has(input.conversationId)) {
          return;
        }

        socket
          .to(getDmSocketRoomName(input.conversationId))
          .emit("dm:typing:update", {
            conversationId: input.conversationId,
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
      joinedConversations.clear();
    });
  });
}
