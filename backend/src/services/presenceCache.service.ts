import { getRedisClient, isRedisEnabled } from "../lib/redis";

const SOCKETS_SUFFIX = ":sockets";
const SOCKET_OWNER_PREFIX = "socket:owner:";
const ONLINE_USER_PREFIX = "online:user:";
const USER_CURRENT_ROOM_PREFIX = "user:currentRoom:";
const ROOM_ACTIVE_PREFIX = "room:active:";
const ROOM_USER_SOCKETS_PREFIX = "room:user:";

interface PresenceStore {
  setUserOnline(userId: string, socketId: string): Promise<void>;
  removeUserSocket(userId: string, socketId: string): Promise<boolean>;
  isUserOnline(userId: string): Promise<boolean>;
  setUserCurrentRoom(userId: string, roomId: string): Promise<void>;
  removeUserCurrentRoom(userId: string): Promise<void>;
  getUserCurrentRoom(userId: string): Promise<string | null>;
  addUserToActiveRoom(
    roomId: string,
    userId: string,
    socketId: string,
  ): Promise<void>;
  removeUserFromActiveRoom(
    roomId: string,
    userId: string,
    socketId: string,
  ): Promise<void>;
  getActiveRoomUsers(roomId: string): Promise<string[]>;
}

const memoryOnlineSockets = new Map<string, Set<string>>();
const memorySocketOwners = new Map<string, string>();
const memoryCurrentRooms = new Map<string, string>();
const memoryActiveRoomUsers = new Map<string, Map<string, Set<string>>>();

function getMemoryRoomUserSockets(roomId: string, userId: string): Set<string> {
  const roomMap =
    memoryActiveRoomUsers.get(roomId) ?? new Map<string, Set<string>>();

  if (!memoryActiveRoomUsers.has(roomId)) {
    memoryActiveRoomUsers.set(roomId, roomMap);
  }

  const userSockets = roomMap.get(userId) ?? new Set<string>();
  roomMap.set(userId, userSockets);
  return userSockets;
}

const memoryStore: PresenceStore = {
  async setUserOnline(userId, socketId) {
    const sockets = memoryOnlineSockets.get(userId) ?? new Set<string>();
    sockets.add(socketId);
    memoryOnlineSockets.set(userId, sockets);
    memorySocketOwners.set(socketId, userId);
  },

  async removeUserSocket(userId, socketId) {
    const sockets = memoryOnlineSockets.get(userId);

    if (sockets) {
      sockets.delete(socketId);

      if (sockets.size === 0) {
        memoryOnlineSockets.delete(userId);
      } else {
        memoryOnlineSockets.set(userId, sockets);
      }
    }

    memorySocketOwners.delete(socketId);
    return (memoryOnlineSockets.get(userId)?.size ?? 0) > 0;
  },

  async isUserOnline(userId) {
    return (memoryOnlineSockets.get(userId)?.size ?? 0) > 0;
  },

  async setUserCurrentRoom(userId, roomId) {
    memoryCurrentRooms.set(userId, roomId);
  },

  async removeUserCurrentRoom(userId) {
    memoryCurrentRooms.delete(userId);
  },

  async getUserCurrentRoom(userId) {
    return memoryCurrentRooms.get(userId) ?? null;
  },

  async addUserToActiveRoom(roomId, userId, socketId) {
    getMemoryRoomUserSockets(roomId, userId).add(socketId);
  },

  async removeUserFromActiveRoom(roomId, userId, socketId) {
    const userSockets = memoryActiveRoomUsers.get(roomId)?.get(userId);

    if (!userSockets) {
      return;
    }

    userSockets.delete(socketId);

    if (userSockets.size === 0) {
      memoryActiveRoomUsers.get(roomId)?.delete(userId);

      if (memoryActiveRoomUsers.get(roomId)?.size === 0) {
        memoryActiveRoomUsers.delete(roomId);
      }
    }
  },

  async getActiveRoomUsers(roomId) {
    const roomMap = memoryActiveRoomUsers.get(roomId);

    if (!roomMap) {
      return [];
    }

    return [...roomMap.keys()];
  },
};

function roomUserSocketsKey(roomId: string, userId: string): string {
  return `${ROOM_USER_SOCKETS_PREFIX}${roomId}:${userId}${SOCKETS_SUFFIX}`;
}

const redisStore: PresenceStore = {
  async setUserOnline(userId, socketId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.setUserOnline(userId, socketId);
    }

    await client.sAdd(`${ONLINE_USER_PREFIX}${userId}${SOCKETS_SUFFIX}`, socketId);
    await client.set(`${SOCKET_OWNER_PREFIX}${socketId}`, userId);
  },

  async removeUserSocket(userId, socketId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.removeUserSocket(userId, socketId);
    }

    await client.sRem(`${ONLINE_USER_PREFIX}${userId}${SOCKETS_SUFFIX}`, socketId);
    await client.del(`${SOCKET_OWNER_PREFIX}${socketId}`);

    const remaining = await client.sCard(
      `${ONLINE_USER_PREFIX}${userId}${SOCKETS_SUFFIX}`,
    );

    return remaining > 0;
  },

  async isUserOnline(userId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.isUserOnline(userId);
    }

    const count = await client.sCard(
      `${ONLINE_USER_PREFIX}${userId}${SOCKETS_SUFFIX}`,
    );

    return count > 0;
  },

  async setUserCurrentRoom(userId, roomId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.setUserCurrentRoom(userId, roomId);
    }

    await client.set(`${USER_CURRENT_ROOM_PREFIX}${userId}`, roomId);
  },

  async removeUserCurrentRoom(userId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.removeUserCurrentRoom(userId);
    }

    await client.del(`${USER_CURRENT_ROOM_PREFIX}${userId}`);
  },

  async getUserCurrentRoom(userId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.getUserCurrentRoom(userId);
    }

    return (await client.get(`${USER_CURRENT_ROOM_PREFIX}${userId}`)) ?? null;
  },

  async addUserToActiveRoom(roomId, userId, socketId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.addUserToActiveRoom(roomId, userId, socketId);
    }

    await client.sAdd(roomUserSocketsKey(roomId, userId), socketId);
    await client.sAdd(`${ROOM_ACTIVE_PREFIX}${roomId}`, userId);
  },

  async removeUserFromActiveRoom(roomId, userId, socketId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.removeUserFromActiveRoom(roomId, userId, socketId);
    }

    await client.sRem(roomUserSocketsKey(roomId, userId), socketId);

    const remaining = await client.sCard(roomUserSocketsKey(roomId, userId));

    if (remaining === 0) {
      await client.del(roomUserSocketsKey(roomId, userId));
      await client.sRem(`${ROOM_ACTIVE_PREFIX}${roomId}`, userId);
    }
  },

  async getActiveRoomUsers(roomId) {
    const client = getRedisClient();

    if (!client?.isOpen) {
      return memoryStore.getActiveRoomUsers(roomId);
    }

    return client.sMembers(`${ROOM_ACTIVE_PREFIX}${roomId}`);
  },
};

function getStore(): PresenceStore {
  if (isRedisEnabled() && getRedisClient()?.isOpen) {
    return redisStore;
  }

  return memoryStore;
}

export async function setUserOnline(userId: string, socketId: string): Promise<void> {
  await getStore().setUserOnline(userId, socketId);
}

export async function removeUserSocket(
  userId: string,
  socketId: string,
): Promise<boolean> {
  return getStore().removeUserSocket(userId, socketId);
}

export async function setUserOffline(userId: string): Promise<void> {
  const store = getStore();
  const client = getRedisClient();

  if (client?.isOpen && isRedisEnabled()) {
    const socketIds = await client.sMembers(
      `${ONLINE_USER_PREFIX}${userId}${SOCKETS_SUFFIX}`,
    );

    for (const socketId of socketIds) {
      await store.removeUserSocket(userId, socketId);
    }

    await store.removeUserCurrentRoom(userId);
    return;
  }

  const socketIds = [...(memoryOnlineSockets.get(userId) ?? [])];

  for (const socketId of socketIds) {
    await store.removeUserSocket(userId, socketId);
  }

  await store.removeUserCurrentRoom(userId);
}

export async function isUserOnline(userId: string): Promise<boolean> {
  return getStore().isUserOnline(userId);
}

export async function setUserCurrentRoom(
  userId: string,
  roomId: string,
): Promise<void> {
  await getStore().setUserCurrentRoom(userId, roomId);
}

export async function removeUserCurrentRoom(userId: string): Promise<void> {
  await getStore().removeUserCurrentRoom(userId);
}

export async function getUserCurrentRoom(userId: string): Promise<string | null> {
  return getStore().getUserCurrentRoom(userId);
}

export async function addUserToActiveRoom(
  roomId: string,
  userId: string,
  socketId: string,
): Promise<void> {
  await getStore().addUserToActiveRoom(roomId, userId, socketId);
}

export async function removeUserFromActiveRoom(
  roomId: string,
  userId: string,
  socketId: string,
): Promise<void> {
  await getStore().removeUserFromActiveRoom(roomId, userId, socketId);
}

export async function getActiveRoomUsers(roomId: string): Promise<string[]> {
  return getStore().getActiveRoomUsers(roomId);
}

export function isPresenceCacheUsingRedis(): boolean {
  return isRedisEnabled() && Boolean(getRedisClient()?.isOpen);
}
