export type UserRole = "USER" | "ADMIN" | "MODERATOR";

export type ReportStatus = "OPEN" | "REVIEWED" | "RESOLVED" | "REJECTED";

export type ReportTargetType = "USER" | "MESSAGE" | "ROOM";

export interface AdminSummary {
  usersCount: number;
  roomsCount: number;
  openReportsCount: number;
  messagesCount: number;
  activeRoomsCount: number;
}

export interface AdminAnalyticsSummary {
  usersRegistered: number;
  roomsCreated: number;
  messagesSent: number;
  dmMessagesSent: number;
  watchPartiesStarted: number;
  activeUsersToday: number;
}

export interface AdminReportUser {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
}

export interface AdminReportRoom {
  id: string;
  name: string;
  slug: string;
  category: string;
  isActive: boolean;
}

export interface AdminReportMessage {
  id: string;
  content: string;
  roomId: string;
  createdAt: string;
  deletedAt: string | null;
  sender: AdminReportUser;
}

export interface AdminReportLinks {
  profilePath: string | null;
  roomPath: string | null;
}

export interface AdminReport {
  id: string;
  targetType: ReportTargetType;
  reason: string;
  description: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  reporter: AdminReportUser;
  targetUser: AdminReportUser | null;
  targetRoom: AdminReportRoom | null;
  targetMessage: AdminReportMessage | null;
  links: AdminReportLinks;
}

export interface AdminReportsResponse {
  reports: AdminReport[];
  nextCursor?: string | null;
  meta: { total: number };
}

export interface AdminReportResponse {
  report: AdminReport;
}

export interface AdminReportsFilters {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  limit?: number;
  cursor?: string;
}

export const REPORT_STATUS_OPTIONS: { value: ReportStatus; label: string }[] = [
  { value: "OPEN", label: "Açık" },
  { value: "REVIEWED", label: "İncelendi" },
  { value: "RESOLVED", label: "Çözüldü" },
  { value: "REJECTED", label: "Reddedildi" },
];

export const REPORT_TARGET_TYPE_OPTIONS: {
  value: ReportTargetType;
  label: string;
}[] = [
  { value: "USER", label: "Kullanıcı" },
  { value: "MESSAGE", label: "Mesaj" },
  { value: "ROOM", label: "Oda" },
];

export function isAdminPanelRole(role?: UserRole | null): boolean {
  return role === "ADMIN" || role === "MODERATOR";
}

export function isAdminRole(role?: UserRole | null): boolean {
  return role === "ADMIN";
}
