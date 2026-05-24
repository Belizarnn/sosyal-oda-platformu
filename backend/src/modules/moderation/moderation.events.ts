import type { RoomMember } from "@prisma/client";
import { getIO } from "../../socket/socket";
import { getSocketRoomName } from "../../socket/types";
import { sanitizeMemberUser } from "../../utils/sanitizeRoom";

export function formatModerationMember(member: RoomMember & { user?: Parameters<typeof sanitizeMemberUser>[0] }) {
  return {
    id: member.id,
    userId: member.userId,
    role: member.role,
    joinedAt: member.joinedAt.toISOString(),
    isMuted: member.isMuted,
    isBanned: member.isBanned,
    mutedUntil: member.mutedUntil?.toISOString() ?? null,
    bannedAt: member.bannedAt?.toISOString() ?? null,
    ...(member.user ? { user: sanitizeMemberUser(member.user) } : {}),
  };
}

export function emitModerationEvent(
  roomId: string,
  event:
    | "moderation:user-kicked"
    | "moderation:user-muted"
    | "moderation:user-banned"
    | "moderation:user-unmuted"
    | "moderation:user-unbanned",
  payload: Record<string, unknown>,
) {
  getIO()?.to(getSocketRoomName(roomId)).emit(event, {
    roomId,
    ...payload,
  });
}

export function emitMessageDeleted(roomId: string, messageId: string) {
  getIO()?.to(getSocketRoomName(roomId)).emit("message:deleted", {
    roomId,
    messageId,
  });
}
