import type { ChatMessage } from "@/types/message";
import type { RoomMember, RoomMemberRole } from "@/types/room";

export function canKick(
  currentUserMember: RoomMember | null | undefined,
  targetMember: RoomMember,
  currentUserId?: string | null,
): boolean {
  if (!currentUserMember || !currentUserId) return false;
  if (currentUserMember.userId === targetMember.userId) return false;
  if (targetMember.role === "OWNER") return false;
  if (currentUserMember.role === "MEMBER") return false;
  if (
    currentUserMember.role === "MODERATOR" &&
    targetMember.role !== "MEMBER"
  ) {
    return false;
  }
  return true;
}

export function canMute(
  currentUserMember: RoomMember | null | undefined,
  targetMember: RoomMember,
  currentUserId?: string | null,
): boolean {
  return canKick(currentUserMember, targetMember, currentUserId);
}

export function canBan(
  currentUserMember: RoomMember | null | undefined,
  targetMember: RoomMember,
  currentUserId?: string | null,
): boolean {
  if (!currentUserMember || !currentUserId) return false;
  return (
    currentUserMember.role === "OWNER" &&
    canKick(currentUserMember, targetMember, currentUserId)
  );
}

export function canDeleteMessage(
  currentUserId: string | null | undefined,
  message: ChatMessage,
  currentUserRole: RoomMemberRole | null | undefined,
  members: RoomMember[],
): boolean {
  if (!currentUserId) return false;
  if (message.sender.id === currentUserId) return true;
  if (!currentUserRole || currentUserRole === "MEMBER") return false;

  const senderMember = members.find(
    (member) => member.userId === message.sender.id,
  );

  if (currentUserRole === "OWNER") {
    return senderMember?.role !== "OWNER";
  }

  if (currentUserRole === "MODERATOR") {
    return senderMember?.role === "MEMBER";
  }

  return false;
}
