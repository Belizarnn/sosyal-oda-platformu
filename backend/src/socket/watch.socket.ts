import type { Server } from "socket.io";

import {
  watchCountdownPayloadSchema,
  watchJoinPayloadSchema,
  watchPausePayloadSchema,
  watchPlayPayloadSchema,
  watchReadyPayloadSchema,
  watchSeekPayloadSchema,
  watchSetMediaPayloadSchema,
  watchSetVideoPayloadSchema,
  watchTimerSyncPayloadSchema,
} from "../modules/watch/watch.schemas";
import * as watchService from "../modules/watch/watch.service";
import { assertActiveRoomMember } from "../modules/rooms/room.service";
import { AppError } from "../utils/asyncHandler";
import { type AuthenticatedSocket, getSocketRoomName } from "./types";

function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Bir hata oluştu";
}

export function registerWatchHandlers(io: Server): void {
  io.on("connection", (socket: AuthenticatedSocket) => {
    socket.on("watch:join", async (payload, callback) => {
      try {
        const input = watchJoinPayloadSchema.parse(payload);
        await assertActiveRoomMember(socket.data.userId, input.roomId);

        const roomName = getSocketRoomName(input.roomId);
        await socket.join(roomName);

        const watchState = await watchService.getWatchState(
          input.roomId,
          socket.data.userId,
        );
        const queue = await watchService.getWatchQueue(
          input.roomId,
          socket.data.userId,
        );

        if (watchState.mediaState) {
          socket.emit("watch:state-updated", watchState.mediaState);
        }

        if (watchState.readyUsers.length > 0) {
          socket.emit("watch:ready-updated", {
            roomId: input.roomId,
            readyUsers: watchState.readyUsers,
          });
        }

        socket.emit("watch:queue-updated", { roomId: input.roomId, queue });

        callback?.({
          ok: true,
          mediaState: watchState.mediaState,
          readyUsers: watchState.readyUsers,
          queue,
        });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });

    socket.on("watch:set-video", async (payload, callback) => {
      try {
        const input = watchSetVideoPayloadSchema.parse(payload);
        const mediaState = await watchService.setWatchVideo(
          input.roomId,
          socket.data.userId,
          input.videoUrl,
        );

        callback?.({ ok: true, mediaState });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });

    socket.on("watch:set-media", async (payload, callback) => {
      try {
        const input = watchSetMediaPayloadSchema.parse(payload);
        const mediaState = await watchService.setWatchMedia(
          input.roomId,
          socket.data.userId,
          input,
        );

        callback?.({ ok: true, mediaState });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });

    socket.on("watch:ready", async (payload, callback) => {
      try {
        const input = watchReadyPayloadSchema.parse(payload);
        const readyUsers = await watchService.setWatchReady(
          input.roomId,
          socket.data.userId,
          { isReady: input.isReady },
        );

        callback?.({ ok: true, readyUsers });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });

    socket.on("watch:countdown-start", async (payload, callback) => {
      try {
        const input = watchCountdownPayloadSchema.parse(payload);
        const result = await watchService.startWatchCountdown(
          input.roomId,
          socket.data.userId,
          { seconds: input.seconds },
        );

        callback?.({ ok: true, ...result });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });

    socket.on("watch:play", async (payload, callback) => {
      try {
        const input = watchPlayPayloadSchema.parse(payload);
        const mediaState = await watchService.controlWatch(
          input.roomId,
          socket.data.userId,
          { action: "PLAY", currentTime: input.currentTime },
          socket.id,
        );

        callback?.({ ok: true, mediaState });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });

    socket.on("watch:pause", async (payload, callback) => {
      try {
        const input = watchPausePayloadSchema.parse(payload);
        const mediaState = await watchService.controlWatch(
          input.roomId,
          socket.data.userId,
          { action: "PAUSE", currentTime: input.currentTime },
          socket.id,
        );

        callback?.({ ok: true, mediaState });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });

    socket.on("watch:seek", async (payload, callback) => {
      try {
        const input = watchSeekPayloadSchema.parse(payload);
        const mediaState = await watchService.controlWatch(
          input.roomId,
          socket.data.userId,
          { action: "SEEK", currentTime: input.currentTime },
          socket.id,
        );

        callback?.({ ok: true, mediaState });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });

    socket.on("watch:timer-sync", async (payload, callback) => {
      try {
        const input = watchTimerSyncPayloadSchema.parse(payload);
        await assertActiveRoomMember(socket.data.userId, input.roomId);

        const mediaState = await watchService.getFormattedMediaState(input.roomId);
        if (!mediaState || mediaState.hostUserId !== socket.data.userId) {
          throw new AppError(403, "Timer senkronizasyonu yalnızca host tarafından yapılabilir.");
        }

        watchService.emitWatchSync(input.roomId, {
          roomId: input.roomId,
          provider: mediaState.provider,
          mode: mediaState.mode,
          action: input.isPlaying ? "START_TIMER" : "PAUSE",
          currentTime: input.currentTime,
          isPlaying: input.isPlaying,
          hostUserId: mediaState.hostUserId,
        });

        callback?.({ ok: true });
      } catch (error) {
        const message = getErrorMessage(error);
        socket.emit("watch:error", { message });
        callback?.({ ok: false, message });
      }
    });
  });
}
