import {
  FriendRequestStatus,
  NotificationType,
  PresenceStatus,
  PrismaClient,
  ReportStatus,
  ReportTargetType,
  RoomCategory,
  RoomMemberRole,
  RoomType,
  UserRole,
  ConversationType,
} from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;
const DEMO_PASSWORD = "password123";

function orderUserIds(userId1: string, userId2: string): [string, string] {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

const DEMO_USERS = [
  {
    username: "Sudenaz",
    handle: "sudenaz",
    email: "sudenaz@example.com",
    bio: "Gece sohbeti ve anime izlemeyi severim.",
    statusMessage: "Film modundayım",
    profileInterests: ["Film", "Anime", "Oyun"],
    presenceStatus: PresenceStatus.ONLINE,
    role: UserRole.ADMIN,
  },
  {
    username: "Yavuzhan",
    handle: "yavuzhan",
    email: "yavuzhan@example.com",
    bio: "Yazılım ve oyun geliştirme.",
    statusMessage: "Kod yazıyorum",
    profileInterests: ["Yazılım", "Oyun"],
    presenceStatus: PresenceStatus.STUDYING,
    role: UserRole.MODERATOR,
  },
  {
    username: "Duygu",
    handle: "duygu",
    email: "duygu@example.com",
    bio: "Ders çalışma ve müzik.",
    statusMessage: "Sessiz mod",
    profileInterests: ["Ders", "Müzik"],
    presenceStatus: PresenceStatus.IDLE,
    role: UserRole.USER,
  },
  {
    username: "Kaan",
    handle: "kaan",
    email: "kaan@example.com",
    bio: "Oyun lobby ve spor.",
    statusMessage: "Lobby bekliyorum",
    profileInterests: ["Oyun", "Spor"],
    presenceStatus: PresenceStatus.GAMING,
    role: UserRole.USER,
  },
] as const;

const DEMO_ROOMS = [
  {
    slug: "gece-sohbet-odasi",
    name: "Gece Sohbet Odası",
    description: "Gece geç saatlerde sohbet etmek isteyenler için.",
    category: RoomCategory.CHAT,
    type: RoomType.PUBLIC,
    inviteCode: "DEMOCHAT01",
    ownerHandle: "sudenaz",
  },
  {
    slug: "anime-watch-party",
    name: "Anime Watch Party",
    description: "Birlikte anime izleyelim.",
    category: RoomCategory.ANIME,
    type: RoomType.PUBLIC,
    inviteCode: "DEMOANIME1",
    ownerHandle: "sudenaz",
  },
  {
    slug: "yazilim-calisma-odasi",
    name: "Yazılım Çalışma Odası",
    description: "Pair programming ve odaklı çalışma.",
    category: RoomCategory.SOFTWARE,
    type: RoomType.PUBLIC,
    inviteCode: "DEMOCODE01",
    ownerHandle: "sudenaz",
  },
  {
    slug: "sessiz-ders-odasi",
    name: "Sessiz Ders Odası",
    description: "Sessiz çalışma ve ders tekrarı.",
    category: RoomCategory.STUDY,
    type: RoomType.PUBLIC,
    inviteCode: "DEMOSTUDY1",
    ownerHandle: "duygu",
  },
  {
    slug: "oyun-lobby",
    name: "Oyun Lobby",
    description: "Takım kurmak ve oyun sohbeti.",
    category: RoomCategory.GAME,
    type: RoomType.PUBLIC,
    inviteCode: "DEMOGAME01",
    ownerHandle: "kaan",
  },
] as const;

async function upsertDemoUser(
  user: (typeof DEMO_USERS)[number],
  passwordHash: string,
) {
  return prisma.user.upsert({
    where: { handle: user.handle },
    update: {
      username: user.username,
      email: user.email,
      bio: user.bio,
      statusMessage: user.statusMessage,
      profileInterests: [...user.profileInterests],
      presenceStatus: user.presenceStatus,
      role: user.role,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      ...(user.handle === "yavuzhan"
        ? {
            isPremium: true,
            premiumStartedAt: new Date(),
            premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            premiumPlan: "PREMIUM_YEARLY",
            premiumBadgeVisible: true,
            premiumProfileFrame: "violet-glow",
            premiumAvatarEffect: "soft-pulse",
          }
        : {}),
    },
    create: {
      username: user.username,
      handle: user.handle,
      email: user.email,
      passwordHash,
      bio: user.bio,
      statusMessage: user.statusMessage,
      profileInterests: [...user.profileInterests],
      presenceStatus: user.presenceStatus,
      role: user.role,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      ...(user.handle === "yavuzhan"
        ? {
            isPremium: true,
            premiumStartedAt: new Date(),
            premiumExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            premiumPlan: "PREMIUM_YEARLY",
            premiumBadgeVisible: true,
            premiumProfileFrame: "violet-glow",
            premiumAvatarEffect: "soft-pulse",
          }
        : {}),
    },
  });
}

async function upsertDemoRoom(
  room: (typeof DEMO_ROOMS)[number],
  ownerId: string,
) {
  const now = new Date();

  return prisma.room.upsert({
    where: { slug: room.slug },
    update: {
      name: room.name,
      description: room.description,
      category: room.category,
      type: room.type,
      isActive: true,
      inviteEnabled: true,
    },
    create: {
      name: room.name,
      slug: room.slug,
      description: room.description,
      category: room.category,
      type: room.type,
      ownerId,
      inviteCode: room.inviteCode,
      inviteEnabled: true,
      inviteCreatedAt: now,
      inviteUpdatedAt: now,
      currentUserCount: 1,
    },
  });
}

async function ensureRoomMember(
  roomId: string,
  userId: string,
  role: RoomMemberRole,
) {
  await prisma.roomMember.upsert({
    where: {
      roomId_userId: { roomId, userId },
    },
    update: {
      leftAt: null,
      isBanned: false,
      role,
    },
    create: {
      roomId,
      userId,
      role,
    },
  });
}

async function ensureFriendship(userId1: string, userId2: string) {
  const [userAId, userBId] = orderUserIds(userId1, userId2);

  await prisma.friendship.upsert({
    where: {
      userAId_userBId: { userAId, userBId },
    },
    update: {},
    create: { userAId, userBId },
  });
}

async function ensurePendingFriendRequest(senderId: string, receiverId: string) {
  const existing = await prisma.friendRequest.findFirst({
    where: {
      senderId,
      receiverId,
      status: FriendRequestStatus.PENDING,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.friendRequest.create({
    data: {
      senderId,
      receiverId,
      status: FriendRequestStatus.PENDING,
    },
  });
}

async function ensureRoomMessage(
  roomId: string,
  senderId: string,
  content: string,
) {
  const existing = await prisma.message.findFirst({
    where: { roomId, senderId, content },
  });

  if (existing) {
    return existing;
  }

  return prisma.message.create({
    data: { roomId, senderId, content },
  });
}

async function ensureNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string,
) {
  const existing = await prisma.notification.findFirst({
    where: { userId, type, title },
  });

  if (existing) {
    return existing;
  }

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      link,
    },
  });
}

async function ensureDirectConversation(userId1: string, userId2: string) {
  const participations = await prisma.conversationParticipant.findMany({
    where: {
      userId: { in: [userId1, userId2] },
      conversation: { type: ConversationType.DIRECT },
    },
    include: {
      conversation: { include: { participants: true } },
    },
  });

  const [orderedA, orderedB] = orderUserIds(userId1, userId2);

  for (const participation of participations) {
    const participantIds = participation.conversation.participants.map(
      (item) => item.userId,
    );

    if (
      participantIds.length === 2 &&
      participantIds.includes(orderedA) &&
      participantIds.includes(orderedB)
    ) {
      return participation.conversation;
    }
  }

  return prisma.conversation.create({
    data: {
      type: ConversationType.DIRECT,
      participants: {
        create: [{ userId: userId1 }, { userId: userId2 }],
      },
    },
  });
}

async function ensureDirectMessage(
  conversationId: string,
  senderId: string,
  content: string,
) {
  const existing = await prisma.directMessage.findFirst({
    where: { conversationId, senderId, content },
  });

  if (existing) {
    return existing;
  }

  return prisma.directMessage.create({
    data: { conversationId, senderId, content },
  });
}

async function syncRoomMemberCounts() {
  const rooms = await prisma.room.findMany({ select: { id: true } });

  for (const room of rooms) {
    const count = await prisma.roomMember.count({
      where: { roomId: room.id, leftAt: null, isBanned: false },
    });

    await prisma.room.update({
      where: { id: room.id },
      data: { currentUserCount: count },
    });
  }
}

async function main() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEMO_SEED !== "true"
  ) {
    console.error(
      "Demo seed production ortamında engellendi. Bilinçli çalıştırmak için ALLOW_DEMO_SEED=true ekleyin.",
    );
    process.exit(1);
  }

  console.log("Demo verileri yükleniyor...");
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const users = new Map<string, Awaited<ReturnType<typeof upsertDemoUser>>>();

  for (const demoUser of DEMO_USERS) {
    const user = await upsertDemoUser(demoUser, passwordHash);
    users.set(demoUser.handle, user);
    console.log(`✓ Kullanıcı: @${user.handle}`);
  }

  const sudenaz = users.get("sudenaz")!;
  const yavuzhan = users.get("yavuzhan")!;
  const duygu = users.get("duygu")!;
  const kaan = users.get("kaan")!;

  const rooms = new Map<string, Awaited<ReturnType<typeof upsertDemoRoom>>>();

  for (const demoRoom of DEMO_ROOMS) {
    const owner = users.get(demoRoom.ownerHandle)!;
    const room = await upsertDemoRoom(demoRoom, owner.id);
    rooms.set(demoRoom.slug, room);
    await ensureRoomMember(room.id, owner.id, RoomMemberRole.OWNER);
    console.log(`✓ Oda: ${room.name} (/${room.slug})`);
  }

  const geceSohbet = rooms.get("gece-sohbet-odasi")!;
  const yazilimOda = rooms.get("yazilim-calisma-odasi")!;
  const animeOda = rooms.get("anime-watch-party")!;
  const oyunLobby = rooms.get("oyun-lobby")!;

  await ensureRoomMember(geceSohbet.id, yavuzhan.id, RoomMemberRole.MEMBER);
  await ensureRoomMember(geceSohbet.id, duygu.id, RoomMemberRole.MEMBER);
  await ensureRoomMember(yazilimOda.id, yavuzhan.id, RoomMemberRole.MEMBER);
  await ensureRoomMember(animeOda.id, duygu.id, RoomMemberRole.MEMBER);
  await ensureRoomMember(oyunLobby.id, kaan.id, RoomMemberRole.OWNER);

  await ensureFriendship(sudenaz.id, yavuzhan.id);
  await ensureFriendship(sudenaz.id, duygu.id);
  await ensurePendingFriendRequest(kaan.id, sudenaz.id);
  console.log("✓ Arkadaşlık ilişkileri hazır");

  await ensureRoomMessage(
    geceSohbet.id,
    sudenaz.id,
    "Herkese merhaba! Gece sohbetine hoş geldiniz.",
  );
  await ensureRoomMessage(
    geceSohbet.id,
    yavuzhan.id,
    "Selam Sudenaz, buradayım.",
  );
  await ensureRoomMessage(
    geceSohbet.id,
    duygu.id,
    "Ben de katıldım, güzel akşamlar.",
  );
  await ensureRoomMessage(
    yazilimOda.id,
    sudenaz.id,
    "Bugün TypeScript çalışıyoruz, katılan var mı?",
  );
  await ensureRoomMessage(
    yazilimOda.id,
    yavuzhan.id,
    "Ben varım, pair yapalım.",
  );
  console.log("✓ Demo mesajlar eklendi");

  await ensureNotification(
    sudenaz.id,
    NotificationType.FRIEND_REQUEST,
    "Yeni arkadaşlık isteği",
    "Kaan sana arkadaşlık isteği gönderdi.",
    "/friends",
  );
  await ensureNotification(
    sudenaz.id,
    NotificationType.DM_MESSAGE,
    "Yeni mesaj",
    "Yavuzhan: Merhaba, DM testi!",
    "/messages",
  );
  await ensureNotification(
    sudenaz.id,
    NotificationType.SYSTEM,
    "Demo ortamına hoş geldin",
    "Seed verileri yüklendi. MVP demo akışını test edebilirsin.",
    "/dashboard",
  );
  console.log("✓ Demo bildirimler eklendi");

  const conversation = await ensureDirectConversation(sudenaz.id, yavuzhan.id);
  await ensureDirectMessage(
    conversation.id,
    yavuzhan.id,
    "Merhaba Sudenaz, DM testi!",
  );
  await ensureDirectMessage(
    conversation.id,
    sudenaz.id,
    "Selam Yavuzhan, mesajlar çalışıyor!",
  );
  console.log("✓ Demo DM konuşması hazır");

  const demoMessage = await prisma.message.findFirst({
    where: {
      roomId: geceSohbet.id,
      senderId: yavuzhan.id,
      content: "Selam Sudenaz, buradayım.",
    },
  });

  if (demoMessage) {
    const existingReport = await prisma.report.findFirst({
      where: {
        reporterId: kaan.id,
        targetMessageId: demoMessage.id,
        reason: "Uygunsuz içerik",
      },
    });

    if (!existingReport) {
      await prisma.report.create({
        data: {
          reporterId: kaan.id,
          targetType: ReportTargetType.MESSAGE,
          targetMessageId: demoMessage.id,
          targetRoomId: geceSohbet.id,
          reason: "Uygunsuz içerik",
          description: "Demo admin panel test raporu.",
          status: ReportStatus.OPEN,
        },
      });
      console.log("✓ Demo rapor eklendi");
    }
  }

  await syncRoomMemberCounts();

  await prisma.betaAccessCode.upsert({
    where: { code: "BETA-TEST-2026" },
    update: {
      maxUses: 100,
      isActive: true,
    },
    create: {
      code: "BETA-TEST-2026",
      maxUses: 100,
      usedCount: 0,
      isActive: true,
    },
  });
  console.log("✓ Demo beta kodu: BETA-TEST-2026 (maxUses: 100)");

  console.log("\nDemo seed tamamlandı.");
  console.log("Giriş: sudenaz@example.com / password123 (ADMIN)");
  console.log("Moderator test: yavuzhan@example.com / password123 (MODERATOR)");
  console.log("Beta kayıt kodu: BETA-TEST-2026");
  console.log("Davet kodu örneği: DEMOCHAT01 → Gece Sohbet Odası");
}

main()
  .catch((error) => {
    console.error("Seed hatası:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
