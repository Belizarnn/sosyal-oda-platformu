import {
  ConversationType,
  FriendRequestStatus,
  NotificationType,
  PresenceStatus,
  RoomType,
  type Prisma,
  type Room,
  type User,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { trackServerEvent } from "../../lib/analytics";
import {
  getUserCurrentRoom,
  isUserOnline,
} from "../../services/presenceCache.service";
import { AppError } from "../../utils/asyncHandler";
import { sanitizeRoom } from "../../utils/sanitizeRoom";
import { createNotification } from "../notifications/notification.service";
import type { SendFriendRequestInput } from "./friend.schemas";

type TransactionClient = Prisma.TransactionClient;

export function orderUserIds(userId1: string, userId2: string): [string, string] {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
}

export function sanitizeFriendUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
    presenceStatus: user.presenceStatus,
    statusMessage: user.statusMessage,
    lastSeenAt: user.lastSeenAt?.toISOString() ?? null,
  };
}

export function formatFriendRequest(
  request: {
    id: string;
    status: FriendRequestStatus;
    createdAt: Date;
    sender: User;
    receiver: User;
  },
  direction: "incoming" | "outgoing",
) {
  return {
    id: request.id,
    status: request.status,
    createdAt: request.createdAt.toISOString(),
    ...(direction === "incoming"
      ? { sender: sanitizeFriendUser(request.sender) }
      : { receiver: sanitizeFriendUser(request.receiver) }),
  };
}

async function findFriendship(userId1: string, userId2: string) {
  const [userAId, userBId] = orderUserIds(userId1, userId2);

  return prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });
}

async function createFriendship(
  tx: TransactionClient,
  userId1: string,
  userId2: string,
) {
  const [userAId, userBId] = orderUserIds(userId1, userId2);

  return tx.friendship.create({
    data: {
      userAId,
      userBId,
    },
  });
}

async function ensureDirectConversation(
  tx: TransactionClient,
  userId1: string,
  userId2: string,
) {
  const participations = await tx.conversationParticipant.findMany({
    where: {
      userId: { in: [userId1, userId2] },
      conversation: { type: ConversationType.DIRECT },
    },
    include: {
      conversation: {
        include: {
          participants: true,
        },
      },
    },
  });

  const [orderedA, orderedB] = orderUserIds(userId1, userId2);

  for (const participation of participations) {
    const participantIds = participation.conversation.participants
      .map((item) => item.userId)
      .sort();

    if (
      participantIds.length === 2 &&
      participantIds[0] === orderedA &&
      participantIds[1] === orderedB
    ) {
      return participation.conversation;
    }
  }

  return tx.conversation.create({
    data: {
      type: ConversationType.DIRECT,
      participants: {
        create: [{ userId: userId1 }, { userId: userId2 }],
      },
    },
  });
}

async function notifyFriendAccepted(
  originalSenderId: string,
  accepterId: string,
) {
  const accepter = await prisma.user.findUnique({
    where: { id: accepterId },
  });

  if (!accepter) {
    return;
  }

  await createNotification({
    userId: originalSenderId,
    type: NotificationType.FRIEND_ACCEPTED,
    title: "Arkadaşlık isteğin kabul edildi",
    body: `${accepter.username} artık arkadaşın.`,
    link: "/friends",
  });
}

async function acceptFriendRequestTransaction(
  requestId: string,
  receiverId: string,
) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError(404, "Arkadaşlık isteği bulunamadı");
    }

    if (request.receiverId !== receiverId) {
      throw new AppError(403, "Bu isteği yalnızca alıcı kabul edebilir");
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new AppError(400, "Bu istek artık beklemede değil");
    }

    const existingFriendship = await findFriendship(
      request.senderId,
      request.receiverId,
    );

    if (existingFriendship) {
      throw new AppError(409, "Zaten arkadaşsınız");
    }

    await tx.friendRequest.update({
      where: { id: requestId },
      data: { status: FriendRequestStatus.ACCEPTED },
    });

    const friendship = await createFriendship(
      tx,
      request.senderId,
      request.receiverId,
    );

    await ensureDirectConversation(tx, request.senderId, request.receiverId);

    const friendUser = await tx.user.findUnique({
      where: {
        id: request.senderId,
      },
    });

    if (!friendUser) {
      throw new AppError(404, "Kullanıcı bulunamadı");
    }

    return {
      senderId: request.senderId,
      friendship: {
        id: friendship.id,
        createdAt: friendship.createdAt.toISOString(),
        friend: sanitizeFriendUser(friendUser),
      },
    };
  });
}

export async function sendFriendRequest(
  senderId: string,
  input: SendFriendRequestInput,
) {
  const receiver = await prisma.user.findUnique({
    where: { handle: input.receiverHandle },
  });

  if (!receiver) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  if (receiver.id === senderId) {
    throw new AppError(400, "Kendinize arkadaşlık isteği gönderemezsiniz");
  }

  const existingFriendship = await findFriendship(senderId, receiver.id);

  if (existingFriendship) {
    throw new AppError(409, "Zaten arkadaşsınız");
  }

  const outgoingPending = await prisma.friendRequest.findFirst({
    where: {
      senderId,
      receiverId: receiver.id,
      status: FriendRequestStatus.PENDING,
    },
  });

  if (outgoingPending) {
    throw new AppError(409, "Bu kullanıcıya zaten bekleyen istek gönderdiniz");
  }

  const reversePending = await prisma.friendRequest.findFirst({
    where: {
      senderId: receiver.id,
      receiverId: senderId,
      status: FriendRequestStatus.PENDING,
    },
    include: {
      sender: true,
      receiver: true,
    },
  });

  if (reversePending) {
    const result = await acceptFriendRequestTransaction(reversePending.id, senderId);
    await notifyFriendAccepted(reversePending.senderId, senderId);

    return {
      autoAccepted: true,
      request: formatFriendRequest(
        {
          ...reversePending,
          status: FriendRequestStatus.ACCEPTED,
        },
        "incoming",
      ),
      friendship: result.friendship,
    };
  }

  const request = await prisma.friendRequest.create({
    data: {
      senderId,
      receiverId: receiver.id,
    },
    include: {
      sender: true,
      receiver: true,
    },
  });

  await createNotification({
    userId: receiver.id,
    type: NotificationType.FRIEND_REQUEST,
    title: "Yeni arkadaşlık isteği",
    body: `${request.sender.username} sana arkadaşlık isteği gönderdi.`,
    link: "/friends",
  });

  void trackServerEvent({
    eventName: "friend_request_sent",
    userId: senderId,
    properties: { receiverHandle: receiver.handle },
  });

  return {
    autoAccepted: false,
    request: formatFriendRequest(request, "outgoing"),
  };
}

export async function getIncomingFriendRequests(userId: string) {
  const requests = await prisma.friendRequest.findMany({
    where: {
      receiverId: userId,
      status: FriendRequestStatus.PENDING,
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    requests: requests.map((request) => formatFriendRequest(request, "incoming")),
  };
}

export async function getOutgoingFriendRequests(userId: string) {
  const requests = await prisma.friendRequest.findMany({
    where: {
      senderId: userId,
      status: FriendRequestStatus.PENDING,
    },
    include: {
      sender: true,
      receiver: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    requests: requests.map((request) => formatFriendRequest(request, "outgoing")),
  };
}

export async function acceptFriendRequest(requestId: string, userId: string) {
  const result = await acceptFriendRequestTransaction(requestId, userId);
  await notifyFriendAccepted(result.senderId, userId);
  return result;
}

export async function rejectFriendRequest(requestId: string, userId: string) {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Arkadaşlık isteği bulunamadı");
  }

  if (request.receiverId !== userId) {
    throw new AppError(403, "Bu isteği yalnızca alıcı reddedebilir");
  }

  if (request.status !== FriendRequestStatus.PENDING) {
    throw new AppError(400, "Bu istek artık beklemede değil");
  }

  const updated = await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: FriendRequestStatus.REJECTED },
  });

  return {
    request: {
      id: updated.id,
      status: updated.status,
    },
  };
}

export async function cancelFriendRequest(requestId: string, userId: string) {
  const request = await prisma.friendRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new AppError(404, "Arkadaşlık isteği bulunamadı");
  }

  if (request.senderId !== userId) {
    throw new AppError(403, "Bu isteği yalnızca gönderen iptal edebilir");
  }

  if (request.status !== FriendRequestStatus.PENDING) {
    throw new AppError(400, "Bu istek artık beklemede değil");
  }

  const updated = await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: FriendRequestStatus.CANCELLED },
  });

  return {
    request: {
      id: updated.id,
      status: updated.status,
    },
  };
}

export async function getFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    include: {
      userA: true,
      userB: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    friends: friendships.map((friendship) => {
      const friendUser =
        friendship.userAId === userId ? friendship.userB : friendship.userA;

      return {
        ...sanitizeFriendUser(friendUser),
        friendshipCreatedAt: friendship.createdAt.toISOString(),
      };
    }),
  };
}

export async function removeFriend(userId: string, targetUserId: string) {
  if (userId === targetUserId) {
    throw new AppError(400, "Geçersiz istek");
  }

  const [userAId, userBId] = orderUserIds(userId, targetUserId);

  const friendship = await prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });

  if (!friendship) {
    throw new AppError(404, "Arkadaşlık bulunamadı");
  }

  await prisma.friendship.delete({
    where: { id: friendship.id },
  });

  return {
    message: "Arkadaşlık kaldırıldı",
  };
}

async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    select: {
      userAId: true,
      userBId: true,
    },
  });

  return friendships.map((friendship) =>
    friendship.userAId === userId ? friendship.userBId : friendship.userAId,
  );
}

function resolveVisibleCurrentRoom(viewerRoomIds: Set<string>, room: Room) {
  if (room.type === RoomType.PRIVATE) {
    return null;
  }

  if (room.type === RoomType.INVITE_ONLY && !viewerRoomIds.has(room.id)) {
    return null;
  }

  const safeRoom = sanitizeRoom(room);

  return {
    id: safeRoom.id,
    name: safeRoom.name,
    category: safeRoom.category,
    type: safeRoom.type,
  };
}

export async function getFriendsActivity(userId: string) {
  const { friends } = await getFriends(userId);
  const friendIds = friends.map((friend) => friend.id);

  if (friendIds.length === 0) {
    return { friends: [] };
  }

  const [memberships, viewerMemberships] = await Promise.all([
    prisma.roomMember.findMany({
      where: {
        userId: { in: friendIds },
        leftAt: null,
        isBanned: false,
        room: { isActive: true },
      },
      include: { room: true },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.roomMember.findMany({
      where: {
        userId,
        leftAt: null,
        isBanned: false,
      },
      select: { roomId: true },
    }),
  ]);

  const viewerRoomIds = new Set(viewerMemberships.map((membership) => membership.roomId));
  const latestMembershipByFriend = new Map<string, (typeof memberships)[number]>();

  for (const membership of memberships) {
    if (!latestMembershipByFriend.has(membership.userId)) {
      latestMembershipByFriend.set(membership.userId, membership);
    }
  }

  const cachedRoomIds = await Promise.all(
    friends.map((friend) => getUserCurrentRoom(friend.id)),
  );
  const uniqueCachedRoomIds = [
    ...new Set(cachedRoomIds.filter((roomId): roomId is string => Boolean(roomId))),
  ];
  const cachedRooms =
    uniqueCachedRoomIds.length > 0
      ? await prisma.room.findMany({
          where: {
            id: { in: uniqueCachedRoomIds },
            isActive: true,
          },
        })
      : [];
  const cachedRoomMap = new Map(cachedRooms.map((room) => [room.id, room]));
  const onlineFlags = await Promise.all(
    friends.map((friend) => isUserOnline(friend.id)),
  );

  return {
    friends: friends.map((friend, index) => {
      const membership = latestMembershipByFriend.get(friend.id);
      const cachedRoomId = cachedRoomIds[index];
      let currentRoom = null;

      if (cachedRoomId) {
        const cachedRoom = cachedRoomMap.get(cachedRoomId);
        currentRoom = cachedRoom
          ? resolveVisibleCurrentRoom(viewerRoomIds, cachedRoom)
          : null;
      }

      if (!currentRoom && membership) {
        currentRoom = resolveVisibleCurrentRoom(viewerRoomIds, membership.room);
      }

      const presenceStatus = onlineFlags[index]
        ? PresenceStatus.ONLINE
        : friend.presenceStatus;

      return {
        id: friend.id,
        username: friend.username,
        handle: friend.handle,
        avatarUrl: friend.avatarUrl,
        presenceStatus,
        statusMessage: friend.statusMessage,
        currentRoom,
        isRoomMember: currentRoom ? viewerRoomIds.has(currentRoom.id) : false,
      };
    }),
  };
}

export async function getUserSocialInfo(viewerId: string, targetHandle: string) {
  const targetUser = await prisma.user.findUnique({
    where: { handle: targetHandle },
  });

  if (!targetUser) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  const friendship = await findFriendship(viewerId, targetUser.id);
  let friendshipStatus: "FRIENDS" | "PENDING_SENT" | "PENDING_RECEIVED" | "NONE" =
    "NONE";

  if (friendship) {
    friendshipStatus = "FRIENDS";
  } else {
    const [pendingSent, pendingReceived] = await Promise.all([
      prisma.friendRequest.findFirst({
        where: {
          senderId: viewerId,
          receiverId: targetUser.id,
          status: FriendRequestStatus.PENDING,
        },
      }),
      prisma.friendRequest.findFirst({
        where: {
          senderId: targetUser.id,
          receiverId: viewerId,
          status: FriendRequestStatus.PENDING,
        },
      }),
    ]);

    if (pendingSent) {
      friendshipStatus = "PENDING_SENT";
    } else if (pendingReceived) {
      friendshipStatus = "PENDING_RECEIVED";
    }
  }

  const [viewerFriendIds, targetFriendIds] = await Promise.all([
    getFriendIds(viewerId),
    getFriendIds(targetUser.id),
  ]);

  const targetFriendIdSet = new Set(targetFriendIds);
  const mutualIds = viewerFriendIds.filter(
    (friendId) => targetFriendIdSet.has(friendId) && friendId !== targetUser.id,
  );

  const mutualUsers = mutualIds.length
    ? await prisma.user.findMany({
        where: { id: { in: mutualIds.slice(0, 3) } },
      })
    : [];

  return {
    isFriend: Boolean(friendship),
    friendshipStatus,
    mutualFriendsCount: mutualIds.length,
    mutualFriends: mutualUsers.map((user) => sanitizeFriendUser(user)),
  };
}
