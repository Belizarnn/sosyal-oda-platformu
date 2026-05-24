import {
  PresenceStatus,
  RoomCategory,
  RoomType,
  type Room,
  type User,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import {
  getUserCurrentRoom,
  isUserOnline,
} from "../../services/presenceCache.service";
import { sanitizeOwner, sanitizeRoom } from "../../utils/sanitizeRoom";
import { sanitizeFriendUser } from "../friends/friend.service";
import { formatNotification, getUnreadCount } from "../notifications/notification.service";

const INTEREST_CATEGORY_MAP: Record<string, RoomCategory> = {
  oyun: RoomCategory.GAME,
  game: RoomCategory.GAME,
  film: RoomCategory.FILM,
  anime: RoomCategory.ANIME,
  ders: RoomCategory.STUDY,
  study: RoomCategory.STUDY,
  yazılım: RoomCategory.SOFTWARE,
  software: RoomCategory.SOFTWARE,
  müzik: RoomCategory.MUSIC,
  music: RoomCategory.MUSIC,
  spor: RoomCategory.SPORTS,
  sports: RoomCategory.SPORTS,
  sohbet: RoomCategory.CHAT,
  chat: RoomCategory.CHAT,
  sosyal: RoomCategory.CHAT,
};

type RoomWithOwner = Room & { owner: User };

function mapInterestsToCategories(interests: string[]): RoomCategory[] {
  const categories = new Set<RoomCategory>();

  for (const interest of interests) {
    const normalized = interest.trim().toLowerCase();
    const category = INTEREST_CATEGORY_MAP[normalized];

    if (category) {
      categories.add(category);
    }
  }

  return [...categories];
}

function formatDashboardRoom(room: RoomWithOwner, isMember: boolean) {
  const safeRoom = sanitizeRoom(room);

  return {
    id: safeRoom.id,
    name: safeRoom.name,
    slug: safeRoom.slug,
    description: safeRoom.description,
    category: safeRoom.category,
    type: safeRoom.type,
    owner: sanitizeOwner(room.owner),
    currentUserCount: safeRoom.currentUserCount,
    maxUserCount: safeRoom.maxUserCount,
    isActive: safeRoom.isActive,
    createdAt: safeRoom.createdAt.toISOString(),
    isMember,
  };
}

function formatContinueRoom(room: RoomWithOwner) {
  const safeRoom = sanitizeRoom(room);

  return {
    id: safeRoom.id,
    name: safeRoom.name,
    category: safeRoom.category,
    description: safeRoom.description,
    currentUserCount: safeRoom.currentUserCount,
    maxUserCount: safeRoom.maxUserCount,
    isMember: true,
  };
}

async function buildFriendsInRoomsFromCache(
  userId: string,
  friends: ReturnType<typeof sanitizeFriendUser>[],
) {
  const cacheEntries = await Promise.all(
    friends.map(async (friend) => {
      const roomId = await getUserCurrentRoom(friend.id);
      return roomId ? { friend, roomId } : null;
    }),
  );

  const activeEntries = cacheEntries.filter(
    (entry): entry is { friend: (typeof friends)[number]; roomId: string } =>
      entry !== null,
  );

  if (activeEntries.length === 0) {
    return null;
  }

  const roomIds = [...new Set(activeEntries.map((entry) => entry.roomId))];
  const rooms = await prisma.room.findMany({
    where: {
      id: { in: roomIds },
      isActive: true,
      type: RoomType.PUBLIC,
    },
  });
  const roomMap = new Map(rooms.map((room) => [room.id, room]));

  const userMemberships = await prisma.roomMember.findMany({
    where: {
      userId,
      leftAt: null,
      isBanned: false,
      roomId: { in: roomIds },
    },
    select: { roomId: true },
  });
  const userMembershipRoomIds = new Set(
    userMemberships.map((membership) => membership.roomId),
  );

  const result = activeEntries
    .map(({ friend, roomId }) => {
      const room = roomMap.get(roomId);

      if (!room) {
        return null;
      }

      return {
        friend,
        room: {
          id: room.id,
          name: room.name,
          category: room.category,
          currentUserCount: room.currentUserCount,
        },
        isMember: userMembershipRoomIds.has(roomId),
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  return result.length > 0 ? result : null;
}

export async function getDashboard(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profileInterests: true,
    },
  });

  if (!user) {
    return null;
  }

  const interestCategories = mapInterestsToCategories(user.profileInterests);

  const [
    lastMembership,
    roomsJoined,
    friendships,
    unreadNotifications,
    recentNotifications,
    recommendedRoomRows,
  ] = await Promise.all([
    prisma.roomMember.findFirst({
      where: {
        userId,
        leftAt: null,
        isBanned: false,
        room: { isActive: true },
      },
      orderBy: { joinedAt: "desc" },
      include: {
        room: {
          include: { owner: true },
        },
      },
    }),
    prisma.roomMember.count({
      where: {
        userId,
        leftAt: null,
        isBanned: false,
      },
    }),
    prisma.friendship.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: true,
        userB: true,
      },
    }),
    getUnreadCount(userId),
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.room.findMany({
      where: {
        isActive: true,
        type: RoomType.PUBLIC,
        ...(interestCategories.length > 0
          ? { category: { in: interestCategories } }
          : {}),
      },
      include: { owner: true },
      orderBy: [{ currentUserCount: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
  ]);

  const friends = friendships.map((friendship) => {
    const friendUser =
      friendship.userAId === userId ? friendship.userB : friendship.userA;

    return sanitizeFriendUser(friendUser);
  });

  const friendIds = friends.map((friend) => friend.id);
  const recommendedRoomIds = recommendedRoomRows.map((room) => room.id);
  const membershipRoomIds = new Set<string>();

  if (recommendedRoomIds.length > 0 || lastMembership) {
    const membershipRows = await prisma.roomMember.findMany({
      where: {
        userId,
        leftAt: null,
        isBanned: false,
        roomId: {
          in: [
            ...recommendedRoomIds,
            ...(lastMembership ? [lastMembership.roomId] : []),
          ],
        },
      },
      select: { roomId: true },
    });

    for (const row of membershipRows) {
      membershipRoomIds.add(row.roomId);
    }
  }

  let friendsInRooms: Array<{
    friend: ReturnType<typeof sanitizeFriendUser>;
    room: {
      id: string;
      name: string;
      category: RoomCategory;
      currentUserCount: number;
    };
    isMember: boolean;
  }> = [];

  if (friendIds.length > 0) {
    const cachedFriendsInRooms = await buildFriendsInRoomsFromCache(userId, friends);

    if (cachedFriendsInRooms) {
      friendsInRooms = cachedFriendsInRooms;
    } else {
      const friendMemberships = await prisma.roomMember.findMany({
        where: {
          userId: { in: friendIds },
          leftAt: null,
          isBanned: false,
          room: {
            isActive: true,
            type: RoomType.PUBLIC,
          },
        },
        include: {
          user: true,
          room: true,
        },
        orderBy: { joinedAt: "desc" },
        take: 8,
      });

      const userMembershipRoomIds = new Set<string>();

      if (friendMemberships.length > 0) {
        const userMemberships = await prisma.roomMember.findMany({
          where: {
            userId,
            leftAt: null,
            isBanned: false,
            roomId: { in: friendMemberships.map((item) => item.roomId) },
          },
          select: { roomId: true },
        });

        for (const row of userMemberships) {
          userMembershipRoomIds.add(row.roomId);
        }
      }

      friendsInRooms = friendMemberships.map((membership) => ({
        friend: sanitizeFriendUser(membership.user),
        room: {
          id: membership.room.id,
          name: membership.room.name,
          category: membership.room.category,
          currentUserCount: membership.room.currentUserCount,
        },
        isMember: userMembershipRoomIds.has(membership.roomId),
      }));
    }
  }

  const onlineFriendFlags = await Promise.all(
    friends.map(async (friend) => ({
      friend,
      isOnline:
        (await isUserOnline(friend.id)) ||
        friend.presenceStatus !== PresenceStatus.OFFLINE,
    })),
  );

  const onlineFriends = onlineFriendFlags
    .filter((item) => item.isOnline)
    .map((item) => item.friend)
    .slice(0, 6);

  return {
    continueRoom: lastMembership
      ? formatContinueRoom(lastMembership.room)
      : null,
    recommendedRooms: recommendedRoomRows.map((room) =>
      formatDashboardRoom(room, membershipRoomIds.has(room.id)),
    ),
    friendsInRooms,
    onlineFriends,
    recentNotifications: recentNotifications.map(formatNotification),
    quickStats: {
      roomsJoined,
      friendsCount: friends.length,
      unreadNotifications,
    },
  };
}
