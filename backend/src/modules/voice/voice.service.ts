import { prisma } from "../../lib/prisma";
import { createLiveKitToken } from "../../lib/livekit";
import { AppError } from "../../utils/asyncHandler";
import { assertRoomExists } from "../rooms/room.service";

export async function createVoiceToken(userId: string, roomId: string) {
  const room = await assertRoomExists(roomId);

  const membership = await prisma.roomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });

  if (!membership || membership.leftAt !== null || membership.isBanned) {
    throw new AppError(
      403,
      "Voice chat'e katılmak için önce odaya katılmalısın.",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
    },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  const livekit = await createLiveKitToken(user, room);

  return {
    provider: "livekit" as const,
    roomId: room.id,
    roomName: livekit.roomName,
    identity: user.id,
    displayName: user.username,
    token: livekit.token,
    livekitUrl: livekit.livekitUrl,
  };
}
