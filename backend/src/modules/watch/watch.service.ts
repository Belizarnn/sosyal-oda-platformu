import {
  MediaMode,
  MediaProvider,
  RoomMemberRole,
  type RoomMediaState,
  type RoomVideoQueueItem,
  type RoomWatchReady,
  type User,
} from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { trackServerEvent } from "../../lib/analytics";
import { getIO } from "../../socket/socket";
import { getSocketRoomName } from "../../socket/types";
import { AppError } from "../../utils/asyncHandler";
import {
  getMediaMode,
  parseEmbedMediaInput,
  validateExternalProviderInput,
} from "../../utils/mediaParsers";
import {
  normalizeYouTubeWatchUrl,
  parseYouTubeVideoId,
} from "../../utils/parseYouTubeVideoId";
import {
  assertActiveRoomMember,
  assertRoomExists,
} from "../rooms/room.service";
import type {
  SetWatchMediaInput,
  WatchControlInput,
  WatchCountdownInput,
  WatchReadyInput,
} from "./watch.schemas";

type MediaStateWithHost = RoomMediaState & {
  hostUser: Pick<User, "id" | "username" | "handle" | "avatarUrl">;
};

type QueueItemWithUser = RoomVideoQueueItem & {
  addedBy: Pick<User, "id" | "username" | "handle" | "avatarUrl">;
};

type ReadyWithUser = RoomWatchReady & {
  user: Pick<User, "id" | "username" | "handle" | "avatarUrl">;
};

export type FormattedHost = {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
};

export type FormattedMediaState = {
  id: string;
  roomId: string;
  provider: MediaProvider;
  mode: MediaMode;
  videoId: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  externalTitle: string | null;
  externalUrl: string | null;
  title: string | null;
  isPlaying: boolean;
  currentTime: number;
  hostUserId: string;
  countdownEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
  host: FormattedHost;
};

export type FormattedReadyUser = {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  isReady: boolean;
};

export type FormattedQueueItem = {
  id: string;
  roomId: string;
  videoId: string;
  videoUrl: string;
  title: string | null;
  position: number;
  status: "QUEUED" | "PLAYING" | "PLAYED" | "REMOVED";
  addedById: string;
  createdAt: string;
  updatedAt: string;
  addedBy: FormattedHost;
};

export type WatchSyncPayload = {
  roomId: string;
  provider?: MediaProvider;
  mode?: MediaMode;
  action: "PLAY" | "PAUSE" | "SEEK" | "START_TIMER";
  currentTime: number;
  isPlaying: boolean;
  hostUserId: string;
};

export type WatchReadyUpdatedPayload = {
  roomId: string;
  readyUsers: FormattedReadyUser[];
};

export type WatchCountdownStartedPayload = {
  roomId: string;
  seconds: number;
  countdownEndsAt: string;
};

export type WatchStateResult = {
  mediaState: FormattedMediaState | null;
  readyUsers: FormattedReadyUser[];
  host: FormattedHost | null;
};

const mediaStateInclude = {
  hostUser: {
    select: {
      id: true,
      username: true,
      handle: true,
      avatarUrl: true,
    },
  },
} as const;

const queueItemInclude = {
  addedBy: {
    select: {
      id: true,
      username: true,
      handle: true,
      avatarUrl: true,
    },
  },
} as const;

const readyUserInclude = {
  user: {
    select: {
      id: true,
      username: true,
      handle: true,
      avatarUrl: true,
    },
  },
} as const;

function formatHost(user: Pick<User, "id" | "username" | "handle" | "avatarUrl">): FormattedHost {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
  };
}

function formatMediaState(state: MediaStateWithHost): FormattedMediaState {
  return {
    id: state.id,
    roomId: state.roomId,
    provider: state.provider,
    mode: state.mode,
    videoId: state.videoId,
    videoUrl: state.videoUrl,
    embedUrl: state.embedUrl,
    externalTitle: state.externalTitle,
    externalUrl: state.externalUrl,
    title: state.title,
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    hostUserId: state.hostUserId,
    countdownEndsAt: state.countdownEndsAt?.toISOString() ?? null,
    createdAt: state.createdAt.toISOString(),
    updatedAt: state.updatedAt.toISOString(),
    host: formatHost(state.hostUser),
  };
}

function formatQueueItem(item: QueueItemWithUser): FormattedQueueItem {
  return {
    id: item.id,
    roomId: item.roomId,
    videoId: item.videoId,
    videoUrl: item.videoUrl,
    title: item.title,
    position: item.position,
    status: item.status,
    addedById: item.addedById,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    addedBy: formatHost(item.addedBy),
  };
}

function formatReadyUser(record: ReadyWithUser): FormattedReadyUser {
  return {
    id: record.user.id,
    username: record.user.username,
    handle: record.user.handle,
    avatarUrl: record.user.avatarUrl,
    isReady: record.isReady,
  };
}

export function emitWatchStateUpdated(
  roomId: string,
  mediaState: FormattedMediaState,
): void {
  getIO()?.to(getSocketRoomName(roomId)).emit("watch:state-updated", mediaState);
}

export function emitWatchSync(
  roomId: string,
  payload: WatchSyncPayload,
  excludeSocketId?: string,
): void {
  const io = getIO();
  if (!io) {
    return;
  }

  const roomName = getSocketRoomName(roomId);
  const emitter = excludeSocketId
    ? io.to(roomName).except(excludeSocketId)
    : io.to(roomName);

  emitter.emit("watch:sync", payload);
}

export function emitWatchQueueUpdated(
  roomId: string,
  queue: FormattedQueueItem[],
): void {
  getIO()
    ?.to(getSocketRoomName(roomId))
    .emit("watch:queue-updated", { roomId, queue });
}

export function emitWatchReadyUpdated(
  roomId: string,
  readyUsers: FormattedReadyUser[],
): void {
  getIO()
    ?.to(getSocketRoomName(roomId))
    .emit("watch:ready-updated", { roomId, readyUsers });
}

export function emitWatchCountdownStarted(
  roomId: string,
  payload: WatchCountdownStartedPayload,
): void {
  getIO()?.to(getSocketRoomName(roomId)).emit("watch:countdown-started", payload);
}

async function getMediaStateRecord(roomId: string) {
  return prisma.roomMediaState.findUnique({
    where: { roomId },
    include: mediaStateInclude,
  });
}

async function getReadyUserRecords(roomId: string) {
  return prisma.roomWatchReady.findMany({
    where: { roomId },
    include: readyUserInclude,
    orderBy: { updatedAt: "asc" },
  });
}

async function getFormattedReadyUsers(roomId: string) {
  const records = await getReadyUserRecords(roomId);
  return records.map(formatReadyUser);
}

async function resetReadyUsers(roomId: string) {
  await prisma.roomWatchReady.updateMany({
    where: { roomId },
    data: { isReady: false },
  });
  const readyUsers = await getFormattedReadyUsers(roomId);
  emitWatchReadyUpdated(roomId, readyUsers);
  return readyUsers;
}

async function getQueueRecords(roomId: string) {
  return prisma.roomVideoQueueItem.findMany({
    where: {
      roomId,
      status: { in: ["QUEUED", "PLAYING"] },
    },
    orderBy: [{ status: "desc" }, { position: "asc" }],
    include: queueItemInclude,
  });
}

async function getFormattedQueue(roomId: string) {
  const items = await getQueueRecords(roomId);
  return items.map(formatQueueItem);
}

async function assertMediaStateExists(roomId: string) {
  const mediaState = await getMediaStateRecord(roomId);

  if (!mediaState) {
    throw new AppError(404, "Bu odada aktif bir watch party yok");
  }

  return mediaState;
}

function assertHost(userId: string, mediaState: RoomMediaState) {
  if (mediaState.hostUserId !== userId) {
    throw new AppError(403, "Kontroller sadece host kullanıcıda.");
  }
}

function canManageWatchPlayback(
  userId: string,
  membership: { role: RoomMemberRole },
  mediaState: RoomMediaState | null,
) {
  if (!mediaState) {
    return (
      membership.role === RoomMemberRole.OWNER ||
      membership.role === RoomMemberRole.MODERATOR
    );
  }

  return (
    mediaState.hostUserId === userId ||
    membership.role === RoomMemberRole.OWNER ||
    membership.role === RoomMemberRole.MODERATOR
  );
}

function canRemoveQueueItem(
  userId: string,
  membership: { role: RoomMemberRole },
  item: RoomVideoQueueItem,
  mediaState: RoomMediaState | null,
) {
  return (
    item.addedById === userId ||
    membership.role === RoomMemberRole.OWNER ||
    membership.role === RoomMemberRole.MODERATOR ||
    mediaState?.hostUserId === userId
  );
}

function parseAndNormalizeYouTubeUrl(videoUrl: string) {
  const videoId = parseYouTubeVideoId(videoUrl);

  if (!videoId) {
    throw new AppError(400, "Geçerli bir YouTube bağlantısı gir.");
  }

  return {
    videoId,
    normalizedUrl: normalizeYouTubeWatchUrl(videoId),
  };
}

function buildMediaUpsertData(
  userId: string,
  input: SetWatchMediaInput,
): {
  provider: MediaProvider;
  mode: MediaMode;
  videoId: string | null;
  videoUrl: string | null;
  embedUrl: string | null;
  externalTitle: string | null;
  externalUrl: string | null;
  title: string | null;
} {
  const provider = input.provider as MediaProvider;
  const mode = getMediaMode(provider);

  if (mode === MediaMode.EMBED) {
    const parsed = parseEmbedMediaInput(provider, input.url!);
    return {
      provider,
      mode,
      videoId: parsed.videoId,
      videoUrl: parsed.videoUrl,
      embedUrl: parsed.embedUrl,
      externalTitle: null,
      externalUrl: null,
      title: null,
    };
  }

  const external = validateExternalProviderInput(
    provider,
    input.externalTitle,
    input.externalUrl,
  );

  return {
    provider,
    mode,
    videoId: null,
    videoUrl: null,
    embedUrl: null,
    externalTitle: external.externalTitle,
    externalUrl: external.externalUrl,
    title: external.externalTitle,
  };
}

export async function getWatchState(
  roomId: string,
  userId: string,
): Promise<WatchStateResult> {
  await assertRoomExists(roomId);
  await assertActiveRoomMember(userId, roomId);

  const mediaState = await getMediaStateRecord(roomId);
  const formatted = mediaState ? formatMediaState(mediaState) : null;
  const readyUsers =
    formatted?.mode === MediaMode.EXTERNAL_SYNC
      ? await getFormattedReadyUsers(roomId)
      : [];

  return {
    mediaState: formatted,
    readyUsers,
    host: formatted?.host ?? null,
  };
}

export async function getFormattedMediaState(roomId: string) {
  const mediaState = await getMediaStateRecord(roomId);
  return mediaState ? formatMediaState(mediaState) : null;
}

export async function getWatchQueue(roomId: string, userId: string) {
  await assertRoomExists(roomId);
  await assertActiveRoomMember(userId, roomId);
  return getFormattedQueue(roomId);
}

export async function addToWatchQueue(
  roomId: string,
  userId: string,
  videoUrl: string,
) {
  await assertRoomExists(roomId);
  await assertActiveRoomMember(userId, roomId);

  const { videoId, normalizedUrl } = parseAndNormalizeYouTubeUrl(videoUrl);

  const maxPosition = await prisma.roomVideoQueueItem.aggregate({
    where: { roomId, status: "QUEUED" },
    _max: { position: true },
  });

  const item = await prisma.roomVideoQueueItem.create({
    data: {
      roomId,
      addedById: userId,
      videoId,
      videoUrl: normalizedUrl,
      position: (maxPosition._max.position ?? 0) + 1,
      status: "QUEUED",
    },
    include: queueItemInclude,
  });

  const queue = await getFormattedQueue(roomId);
  emitWatchQueueUpdated(roomId, queue);
  return formatQueueItem(item);
}

export async function removeFromWatchQueue(
  roomId: string,
  userId: string,
  itemId: string,
) {
  await assertRoomExists(roomId);
  const membership = await assertActiveRoomMember(userId, roomId);

  const item = await prisma.roomVideoQueueItem.findFirst({
    where: {
      id: itemId,
      roomId,
      status: { in: ["QUEUED", "PLAYING"] },
    },
  });

  if (!item) {
    throw new AppError(404, "Sıradaki video bulunamadı");
  }

  const mediaState = await getMediaStateRecord(roomId);

  if (!canRemoveQueueItem(userId, membership, item, mediaState)) {
    throw new AppError(403, "Bu videoyu sıradan kaldırma yetkin yok");
  }

  await prisma.roomVideoQueueItem.update({
    where: { id: itemId },
    data: { status: "REMOVED" },
  });

  const queue = await getFormattedQueue(roomId);
  emitWatchQueueUpdated(roomId, queue);
  return { message: "Video sıradan kaldırıldı" };
}

export async function playQueueItem(
  roomId: string,
  userId: string,
  itemId: string,
) {
  await assertRoomExists(roomId);
  const membership = await assertActiveRoomMember(userId, roomId);

  const item = await prisma.roomVideoQueueItem.findFirst({
    where: {
      id: itemId,
      roomId,
      status: { in: ["QUEUED", "PLAYING"] },
    },
  });

  if (!item) {
    throw new AppError(404, "Sıradaki video bulunamadı");
  }

  const existingMediaState = await getMediaStateRecord(roomId);

  if (!canManageWatchPlayback(userId, membership, existingMediaState)) {
    throw new AppError(403, "Kontroller sadece host kullanıcıda.");
  }

  const embedUrl = `https://www.youtube.com/embed/${item.videoId}`;

  const mediaState = await prisma.$transaction(async (tx) => {
    await tx.roomVideoQueueItem.updateMany({
      where: { roomId, status: "PLAYING" },
      data: { status: "PLAYED" },
    });

    await tx.roomVideoQueueItem.update({
      where: { id: itemId },
      data: { status: "PLAYING" },
    });

    await tx.roomWatchReady.updateMany({
      where: { roomId },
      data: { isReady: false },
    });

    return tx.roomMediaState.upsert({
      where: { roomId },
      create: {
        roomId,
        provider: MediaProvider.YOUTUBE,
        mode: MediaMode.EMBED,
        videoId: item.videoId,
        videoUrl: item.videoUrl,
        embedUrl,
        hostUserId: userId,
        title: item.title,
        isPlaying: false,
        currentTime: 0,
        countdownEndsAt: null,
        externalTitle: null,
        externalUrl: null,
      },
      update: {
        provider: MediaProvider.YOUTUBE,
        mode: MediaMode.EMBED,
        videoId: item.videoId,
        videoUrl: item.videoUrl,
        embedUrl,
        title: item.title,
        hostUserId: userId,
        isPlaying: false,
        currentTime: 0,
        countdownEndsAt: null,
        externalTitle: null,
        externalUrl: null,
      },
      include: mediaStateInclude,
    });
  });

  const formatted = formatMediaState(mediaState);
  emitWatchStateUpdated(roomId, formatted);

  const queue = await getFormattedQueue(roomId);
  emitWatchQueueUpdated(roomId, queue);
  await resetReadyUsers(roomId);

  return {
    item: formatQueueItem(
      (await prisma.roomVideoQueueItem.findUnique({
        where: { id: itemId },
        include: queueItemInclude,
      }))!,
    ),
    mediaState: formatted,
  };
}

export async function setWatchMedia(
  roomId: string,
  userId: string,
  input: SetWatchMediaInput,
) {
  await assertRoomExists(roomId);
  await assertActiveRoomMember(userId, roomId);

  const mediaData = buildMediaUpsertData(userId, input);

  const mediaState = await prisma.$transaction(async (tx) => {
    await tx.roomWatchReady.updateMany({
      where: { roomId },
      data: { isReady: false },
    });

    return tx.roomMediaState.upsert({
      where: { roomId },
      create: {
        roomId,
        ...mediaData,
        hostUserId: userId,
        isPlaying: false,
        currentTime: 0,
        countdownEndsAt: null,
      },
      update: {
        ...mediaData,
        hostUserId: userId,
        isPlaying: false,
        currentTime: 0,
        countdownEndsAt: null,
      },
      include: mediaStateInclude,
    });
  });

  const formatted = formatMediaState(mediaState);
  emitWatchStateUpdated(roomId, formatted);

  if (formatted.mode === MediaMode.EXTERNAL_SYNC) {
    const readyUsers = await getFormattedReadyUsers(roomId);
    emitWatchReadyUpdated(roomId, readyUsers);
  }

  void trackServerEvent({
    eventName: "watch_video_set",
    userId,
    properties: {
      roomId,
      provider: formatted.provider,
      mode: formatted.mode,
    },
  });

  return formatted;
}

export async function setWatchVideo(
  roomId: string,
  userId: string,
  videoUrl: string,
) {
  return setWatchMedia(roomId, userId, {
    provider: "YOUTUBE",
    url: videoUrl,
  });
}

export async function setWatchReady(
  roomId: string,
  userId: string,
  input: WatchReadyInput,
) {
  await assertRoomExists(roomId);
  await assertActiveRoomMember(userId, roomId);

  const mediaState = await assertMediaStateExists(roomId);

  if (mediaState.mode !== MediaMode.EXTERNAL_SYNC) {
    throw new AppError(400, "Hazır olma yalnızca harici senkron modda kullanılabilir.");
  }

  await prisma.roomWatchReady.upsert({
    where: {
      roomId_userId: { roomId, userId },
    },
    create: {
      roomId,
      userId,
      isReady: input.isReady,
    },
    update: {
      isReady: input.isReady,
    },
  });

  const readyUsers = await getFormattedReadyUsers(roomId);
  emitWatchReadyUpdated(roomId, readyUsers);
  return readyUsers;
}

export async function startWatchCountdown(
  roomId: string,
  userId: string,
  input: WatchCountdownInput,
) {
  await assertRoomExists(roomId);
  await assertActiveRoomMember(userId, roomId);

  const existing = await assertMediaStateExists(roomId);
  assertHost(userId, existing);

  if (existing.mode !== MediaMode.EXTERNAL_SYNC) {
    throw new AppError(400, "Geri sayım yalnızca harici senkron modda kullanılabilir.");
  }

  const countdownEndsAt = new Date(Date.now() + input.seconds * 1000);

  const mediaState = await prisma.roomMediaState.update({
    where: { roomId },
    data: { countdownEndsAt },
    include: mediaStateInclude,
  });

  const formatted = formatMediaState(mediaState);
  emitWatchStateUpdated(roomId, formatted);

  const payload: WatchCountdownStartedPayload = {
    roomId,
    seconds: input.seconds,
    countdownEndsAt: countdownEndsAt.toISOString(),
  };

  emitWatchCountdownStarted(roomId, payload);
  return { mediaState: formatted, ...payload };
}

export async function controlWatch(
  roomId: string,
  userId: string,
  input: WatchControlInput,
  excludeSocketId?: string,
) {
  await assertRoomExists(roomId);
  await assertActiveRoomMember(userId, roomId);

  const existing = await assertMediaStateExists(roomId);
  assertHost(userId, existing);

  const updateData =
    input.action === "PLAY"
      ? { isPlaying: true, currentTime: input.currentTime }
      : input.action === "PAUSE"
        ? { isPlaying: false, currentTime: input.currentTime }
        : { currentTime: input.currentTime };

  const mediaState = await prisma.roomMediaState.update({
    where: { roomId },
    data: updateData,
    include: mediaStateInclude,
  });

  const formatted = formatMediaState(mediaState);
  emitWatchStateUpdated(roomId, formatted);

  const syncAction =
    existing.mode === MediaMode.EXTERNAL_SYNC && input.action === "PLAY"
      ? "START_TIMER"
      : input.action;

  emitWatchSync(
    roomId,
    {
      roomId,
      provider: formatted.provider,
      mode: formatted.mode,
      action: syncAction,
      currentTime: formatted.currentTime,
      isPlaying: formatted.isPlaying,
      hostUserId: formatted.hostUserId,
    },
    excludeSocketId,
  );

  return formatted;
}

export async function takeWatchHost(roomId: string, userId: string) {
  await assertRoomExists(roomId);
  const membership = await assertActiveRoomMember(userId, roomId);
  const existing = await assertMediaStateExists(roomId);

  const isOwner = membership.role === RoomMemberRole.OWNER;
  const isCurrentHost = existing.hostUserId === userId;

  if (!isOwner && !isCurrentHost) {
    // TODO: Normal üyeler için host devralma kuralları sıkılaştırılabilir.
  }

  const mediaState = await prisma.roomMediaState.update({
    where: { roomId },
    data: { hostUserId: userId },
    include: mediaStateInclude,
  });

  const formatted = formatMediaState(mediaState);
  emitWatchStateUpdated(roomId, formatted);
  return formatted;
}

export async function reassignWatchHostOnMemberLeave(
  roomId: string,
  leavingUserId: string,
) {
  const mediaState = await getMediaStateRecord(roomId);

  if (!mediaState || mediaState.hostUserId !== leavingUserId) {
    return;
  }

  const activeMembers = await prisma.roomMember.findMany({
    where: {
      roomId,
      leftAt: null,
      isBanned: false,
      userId: { not: leavingUserId },
    },
    orderBy: { joinedAt: "asc" },
  });

  const ownerMember = activeMembers.find(
    (member) => member.role === RoomMemberRole.OWNER,
  );
  const nextHostId = ownerMember?.userId ?? activeMembers[0]?.userId;

  if (!nextHostId) {
    return;
  }

  const updated = await prisma.roomMediaState.update({
    where: { roomId },
    data: { hostUserId: nextHostId },
    include: mediaStateInclude,
  });

  emitWatchStateUpdated(roomId, formatMediaState(updated));
}
