import type { RoomMember, RoomMemberRole } from "@/types/room";
import type { ChatMessage } from "@/types/message";

export type ReportTargetType = "USER" | "MESSAGE" | "ROOM";

export type ModerationAction =
  | "kick"
  | "mute"
  | "unmute"
  | "ban"
  | "unban";

export interface ReportInput {
  targetType: ReportTargetType;
  targetUserId?: string | null;
  targetMessageId?: string | null;
  targetRoomId?: string | null;
  reason: string;
  description?: string | null;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetUserId: string | null;
  targetMessageId: string | null;
  targetRoomId: string | null;
  reason: string;
  description: string | null;
  status: "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface ReportResponse {
  message: string;
  report: Report;
}

export type { RoomMemberRole };

export interface CurrentUserMemberContext {
  id: string;
  userId: string;
  role: RoomMemberRole;
}

export interface MessageModerationContext {
  currentUserId?: string | null;
  currentUserMember?: CurrentUserMemberContext | null;
  members: RoomMember[];
  roomId: string;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onReportMessage?: (message: ChatMessage) => void;
  onReportUser?: (userId: string) => void;
}
