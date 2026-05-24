import { getToken } from "./auth-storage";
import { API_BASE_URL } from "./env";
import {
  DEFAULT_LOCALE,
  isSupportedLocale,
  LANGUAGE_STORAGE_KEY,
} from "@/i18n/languages";
import { getTranslations } from "@/i18n/loadTranslations";
import type {
  CreateRoomInput,
  RoomDetailResponse,
  RoomFilters,
  RoomListItem,
  RoomListResponse,
  RoomMember,
} from "@/types/room";
import type { ChatMessage, PaginatedMessagesResponse } from "@/types/message";
import type { VoiceTokenResponse } from "@/types/voice";
import type {
  SetWatchMediaInput,
  WatchAction,
  WatchMediaStateResponse,
  WatchPlayQueueItemResponse,
  WatchQueueItemResponse,
  WatchQueueResponse,
  WatchReadyUser,
  WatchStateResponse,
} from "@/types/watch";
import type {
  UpdateProfileInput,
  UserProfile,
} from "@/types/user";
import type {
  DiscoverFilters,
  DiscoverRoomsResponse,
} from "@/types/discover";
import type {
  Friend,
  FriendActivityItem,
  FriendRequest,
  FriendUser,
  UserSocialInfo,
} from "@/types/friend";
import type {
  DMConversation,
  DirectMessage,
  StartDirectConversationInput,
} from "@/types/dm";
import type {
  Notification,
  NotificationsResponse,
  NotificationType,
} from "@/types/notification";
import type {
  InviteJoinInput,
  InvitePreview,
  InviteSettings,
} from "@/types/invite";
import type {
  CreateChannelInput,
  CreateCommunityInput,
  CreateCommunityInviteInput,
  CommunityDetailResponse,
  CommunityFilters,
  CommunityInvite,
  CommunityInvitePreview,
  CommunityListResponse,
  CommunityChannel,
} from "@/types/community";
import type { DashboardResponse } from "@/types/dashboard";
import type { ReportInput, ReportResponse } from "@/types/moderation";
import type {
  ChangePasswordInput,
  NotificationPreferences,
  UpdatePreferencesInput,
} from "@/types/settings";
import type {
  UpdatePremiumPreferencesInput,
  PremiumStatusResponse,
  PremiumCheckoutPlan,
} from "@/types/premium";
import type {
  AdminReportResponse,
  AdminReportsFilters,
  AdminReportsResponse,
  AdminSummary,
  AdminAnalyticsSummary,
  ReportStatus,
  UserRole,
} from "@/types/admin";
import type {
  AdminBetaCodesResponse,
  BetaAccessCode,
  CreateBetaCodeInput,
  CreateBetaCodeResponse,
  PublicConfig,
} from "@/types/public";
import type {
  AdminFeedbackFilters,
  AdminFeedbackItem,
  AdminFeedbackResponse,
  FeedbackStatus,
  SubmitFeedbackInput,
  SubmitFeedbackResponse,
  UpdateFeedbackStatusResponse,
} from "@/types/feedback";

export type {
  CreateRoomInput,
  RoomDetailResponse,
  RoomFilters,
  RoomListItem,
} from "@/types/room";

export { API_BASE_URL } from "./env";

export type PresenceStatus =
  | "ONLINE"
  | "IDLE"
  | "IN_ROOM"
  | "WATCHING"
  | "STUDYING"
  | "LISTENING"
  | "GAMING"
  | "OFFLINE";

export interface AuthUser {
  id: string;
  username: string;
  handle: string;
  email: string;
  role?: UserRole;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  statusMessage: string | null;
  presenceStatus: PresenceStatus;
  profileInterests: string[];
  notifyFriendRequests?: boolean;
  notifyFriendAccepted?: boolean;
  notifyDmMessages?: boolean;
  notifyRoomModeration?: boolean;
  notifyRoomActivity?: boolean;
  notifySystem?: boolean;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  isPremium: boolean;
  premiumStartedAt: string | null;
  premiumExpiresAt: string | null;
  premiumPlan: string | null;
  premiumBadgeVisible: boolean;
  premiumProfileFrame: string | null;
  premiumAvatarEffect: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export interface MeResponse {
  user: AuthUser;
}

export interface UpdatePresencePayload {
  presenceStatus: PresenceStatus;
  statusMessage?: string | null;
}

export interface UpdatePresenceResponse {
  user: AuthUser;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
}

function getClientLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return isSupportedLocale(stored) ? stored : DEFAULT_LOCALE;
}

function getPlatformAccessRequiredMessage(): string {
  const dict = getTranslations(getClientLocale());
  return (
    dict["auth.platformAccessRequired"] ??
    "Odalara ve topluluklara erişmek için giriş yapmalısın."
  );
}

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;
  const token =
    options.token !== undefined
      ? options.token
      : typeof window !== "undefined"
        ? getToken()
        : null;

  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    (requestHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    code?: string;
  };

  if (!response.ok) {
    let message = data.message ?? "Bir sorun oluştu.";

    if (response.status === 401) {
      message =
        data.code === "UNAUTHORIZED"
          ? getPlatformAccessRequiredMessage()
          : (data.message ?? "Oturumun sona ermiş olabilir.");
    } else if (response.status === 403) {
      message = data.message ?? "Bu işlem için yetkin yok.";
    } else if (response.status === 429) {
      message =
        data.message ?? "Çok fazla deneme yaptın. Biraz sonra tekrar dene.";
    } else if (response.status >= 500) {
      message = data.message ?? "Bir sorun oluştu. Lütfen tekrar dene.";
    }

    throw new ApiError(message, response.status, data.code);
  }

  return data as T;
}

export interface RegisterPayload {
  username: string;
  handle: string;
  email: string;
  password: string;
  betaCode?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function register(payload: RegisterPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function getPublicConfig(): Promise<PublicConfig> {
  return apiRequest<PublicConfig>("/public/config", {
    method: "GET",
  });
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function resendVerificationEmail(): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/resend-verification", {
    method: "POST",
  });
}

export function verifyEmail(token: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: { token },
  });
}

export function forgotPassword(email: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });
}

export function getPremiumStatus(): Promise<PremiumStatusResponse> {
  return apiRequest<PremiumStatusResponse>("/premium/status", {
    method: "GET",
  });
}

export function updatePremiumPreferences(
  data: UpdatePremiumPreferencesInput,
): Promise<{ user: AuthUser; status: PremiumStatusResponse }> {
  return apiRequest<{ user: AuthUser; status: PremiumStatusResponse }>(
    "/premium/preferences",
    {
      method: "PATCH",
      body: data,
    },
  );
}

export function createCheckoutSession(
  plan: PremiumCheckoutPlan,
): Promise<{ checkoutUrl: string }> {
  return apiRequest<{ checkoutUrl: string }>("/payments/create-checkout-session", {
    method: "POST",
    body: { plan },
  });
}

export function createCustomerPortalSession(): Promise<{ portalUrl: string }> {
  return apiRequest<{ portalUrl: string }>(
    "/payments/create-customer-portal-session",
    {
      method: "POST",
    },
  );
}

export function getMe(token?: string | null): Promise<MeResponse> {
  return apiRequest<MeResponse>("/users/me", {
    method: "GET",
    token,
  });
}

export function updatePresence(
  payload: UpdatePresencePayload,
): Promise<UpdatePresenceResponse> {
  return apiRequest<UpdatePresenceResponse>("/users/me/presence", {
    method: "PATCH",
    body: payload,
  });
}

export function getRooms(
  filters: RoomFilters = {},
): Promise<RoomListResponse> {
  const params = new URLSearchParams();

  if (filters.category) params.set("category", filters.category);
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.cursor) params.set("cursor", filters.cursor);

  const query = params.toString();
  const path = query ? `/rooms?${query}` : "/rooms";

  return apiRequest<RoomListResponse>(path, { method: "GET" });
}

export function getRoomById(id: string): Promise<RoomDetailResponse> {
  return apiRequest<RoomDetailResponse>(`/rooms/${id}`, { method: "GET" });
}

export function createRoom(data: CreateRoomInput): Promise<{ room: RoomListItem }> {
  return apiRequest<{ room: RoomListItem }>("/rooms", {
    method: "POST",
    body: data,
  });
}

export function joinRoom(
  id: string,
  input: InviteJoinInput = {},
): Promise<RoomDetailResponse> {
  const body: InviteJoinInput = {};

  if (input.password) {
    body.password = input.password;
  }

  if (input.inviteCode) {
    body.inviteCode = input.inviteCode;
  }

  return apiRequest<RoomDetailResponse>(`/rooms/${id}/join`, {
    method: "POST",
    body,
  });
}

export function getInvitePreview(
  inviteCode: string,
  token?: string | null,
): Promise<InvitePreview> {
  return apiRequest<InvitePreview>(`/invites/${encodeURIComponent(inviteCode)}`, {
    method: "GET",
    token,
  });
}

export function regenerateRoomInvite(roomId: string): Promise<InviteSettings> {
  return apiRequest<InviteSettings>(`/rooms/${roomId}/invite/regenerate`, {
    method: "POST",
  });
}

export function updateInviteSettings(
  roomId: string,
  inviteEnabled: boolean,
): Promise<InviteSettings> {
  return apiRequest<InviteSettings>(`/rooms/${roomId}/invite/settings`, {
    method: "PATCH",
    body: { inviteEnabled },
  });
}

export function leaveRoom(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/rooms/${id}/leave`, {
    method: "POST",
  });
}

export type { ChatMessage } from "@/types/message";

export type { PaginatedMessagesResponse } from "@/types/message";

export function getRoomMessages(
  roomId: string,
  query: { limit?: number; before?: string } = {},
): Promise<PaginatedMessagesResponse> {
  const params = new URLSearchParams();

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.before) {
    params.set("before", query.before);
  }

  const suffix = params.toString();
  const path = suffix
    ? `/rooms/${roomId}/messages?${suffix}`
    : `/rooms/${roomId}/messages`;

  return apiRequest<PaginatedMessagesResponse>(path, { method: "GET" });
}

export type { VoiceTokenResponse } from "@/types/voice";

export function requestVoiceToken(roomId: string): Promise<VoiceTokenResponse> {
  return apiRequest<VoiceTokenResponse>("/voice/token", {
    method: "POST",
    body: { roomId },
  });
}

export function getWatchState(roomId: string): Promise<WatchStateResponse> {
  return apiRequest<WatchStateResponse>(`/rooms/${roomId}/watch`, {
    method: "GET",
  });
}

export function setWatchVideo(
  roomId: string,
  videoUrl: string,
): Promise<WatchMediaStateResponse> {
  return apiRequest<WatchMediaStateResponse>(`/rooms/${roomId}/watch/set-video`, {
    method: "POST",
    body: { videoUrl },
  });
}

export function setWatchMedia(
  roomId: string,
  data: SetWatchMediaInput,
): Promise<WatchMediaStateResponse> {
  return apiRequest<WatchMediaStateResponse>(`/rooms/${roomId}/watch/set-media`, {
    method: "POST",
    body: data,
  });
}

export function setWatchReady(
  roomId: string,
  isReady: boolean,
): Promise<{ readyUsers: WatchReadyUser[] }> {
  return apiRequest<{ readyUsers: WatchReadyUser[] }>(`/rooms/${roomId}/watch/ready`, {
    method: "POST",
    body: { isReady },
  });
}

export function startWatchCountdown(
  roomId: string,
  seconds: 3 | 5 | 10,
): Promise<WatchMediaStateResponse & { seconds: number; countdownEndsAt: string }> {
  return apiRequest(`/rooms/${roomId}/watch/countdown`, {
    method: "POST",
    body: { seconds },
  });
}

export function controlWatch(
  roomId: string,
  action: WatchAction,
  currentTime: number,
): Promise<WatchMediaStateResponse> {
  return apiRequest<WatchMediaStateResponse>(`/rooms/${roomId}/watch/control`, {
    method: "POST",
    body: { action, currentTime },
  });
}

export function takeWatchHost(roomId: string): Promise<WatchMediaStateResponse> {
  return apiRequest<WatchMediaStateResponse>(`/rooms/${roomId}/watch/take-host`, {
    method: "POST",
    body: {},
  });
}

export function getWatchQueue(roomId: string): Promise<WatchQueueResponse> {
  return apiRequest<WatchQueueResponse>(`/rooms/${roomId}/watch/queue`, {
    method: "GET",
  });
}

export function addToWatchQueue(
  roomId: string,
  videoUrl: string,
): Promise<WatchQueueItemResponse> {
  return apiRequest<WatchQueueItemResponse>(`/rooms/${roomId}/watch/queue`, {
    method: "POST",
    body: { videoUrl },
  });
}

export function removeFromWatchQueue(
  roomId: string,
  itemId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/rooms/${roomId}/watch/queue/${itemId}`,
    {
      method: "DELETE",
    },
  );
}

export function playWatchQueueItem(
  roomId: string,
  itemId: string,
): Promise<WatchPlayQueueItemResponse> {
  return apiRequest<WatchPlayQueueItemResponse>(
    `/rooms/${roomId}/watch/queue/${itemId}/play`,
    {
      method: "POST",
      body: {},
    },
  );
}

export type {
  RoomMediaState,
  SetWatchMediaInput,
  WatchAction,
  WatchQueueItem,
  WatchReadyUser,
  WatchSyncPayload,
  WatchQueueUpdatedPayload,
} from "@/types/watch";

export interface UserProfileResponse {
  profile: UserProfile;
}

export interface UpdateProfileResponse {
  user: AuthUser;
}

export function getUserProfile(handle: string): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>(`/users/${encodeURIComponent(handle)}`, {
    method: "GET",
  });
}

export function updateMyProfile(
  data: UpdateProfileInput,
): Promise<UpdateProfileResponse> {
  return apiRequest<UpdateProfileResponse>("/users/me/profile", {
    method: "PATCH",
    body: data,
  });
}

export function changePassword(
  data: ChangePasswordInput,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/users/me/password", {
    method: "PATCH",
    body: data,
  });
}

export interface UpdatePreferencesResponse {
  preferences: NotificationPreferences;
}

export function updateNotificationPreferences(
  data: UpdatePreferencesInput,
): Promise<UpdatePreferencesResponse> {
  return apiRequest<UpdatePreferencesResponse>("/notifications/preferences", {
    method: "PATCH",
    body: data,
  });
}

export function getNotificationPreferences(): Promise<UpdatePreferencesResponse> {
  return apiRequest<UpdatePreferencesResponse>("/notifications/preferences", {
    method: "GET",
  });
}

export type { ChangePasswordInput, NotificationPreferences, UpdatePreferencesInput } from "@/types/settings";

export type { UpdateProfileInput, UserProfile } from "@/types/user";

export function getDiscoverRooms(
  filters: DiscoverFilters = {},
): Promise<DiscoverRoomsResponse> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.cursor) params.set("cursor", filters.cursor);

  const query = params.toString();
  const path = query ? `/discover/rooms?${query}` : "/discover/rooms";

  return apiRequest<DiscoverRoomsResponse>(path, {
    method: "GET",
    token: null,
  });
}

export type {
  DiscoverFilters,
  DiscoverRoom,
  DiscoverRoomsResponse,
  DiscoverSort,
} from "@/types/discover";

export type { ReportInput, ReportResponse } from "@/types/moderation";

export function kickRoomMember(
  roomId: string,
  userId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/rooms/${roomId}/members/${userId}/kick`,
    { method: "POST", body: {} },
  );
}

export function muteRoomMember(
  roomId: string,
  userId: string,
  mutedUntil?: string | null,
): Promise<{ member: RoomMember }> {
  return apiRequest<{ member: RoomMember }>(
    `/rooms/${roomId}/members/${userId}/mute`,
    { method: "POST", body: { mutedUntil: mutedUntil ?? null } },
  );
}

export function unmuteRoomMember(
  roomId: string,
  userId: string,
): Promise<{ member: RoomMember }> {
  return apiRequest<{ member: RoomMember }>(
    `/rooms/${roomId}/members/${userId}/unmute`,
    { method: "POST", body: {} },
  );
}

export function banRoomMember(
  roomId: string,
  userId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/rooms/${roomId}/members/${userId}/ban`,
    { method: "POST", body: {} },
  );
}

export function unbanRoomMember(
  roomId: string,
  userId: string,
): Promise<{ member: RoomMember }> {
  return apiRequest<{ member: RoomMember }>(
    `/rooms/${roomId}/members/${userId}/unban`,
    { method: "POST", body: {} },
  );
}

export function deleteRoomMessage(
  roomId: string,
  messageId: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(
    `/rooms/${roomId}/messages/${messageId}`,
    { method: "DELETE" },
  );
}

export function createReport(data: ReportInput): Promise<ReportResponse> {
  return apiRequest<ReportResponse>("/reports", {
    method: "POST",
    body: data,
  });
}

export function submitFeedback(
  data: SubmitFeedbackInput,
): Promise<SubmitFeedbackResponse> {
  return apiRequest<SubmitFeedbackResponse>("/feedback", {
    method: "POST",
    body: data,
  });
}

export function getAdminSummary(): Promise<AdminSummary> {
  return apiRequest<AdminSummary>("/admin/summary", { method: "GET" });
}

export function getAdminAnalyticsSummary(): Promise<AdminAnalyticsSummary> {
  return apiRequest<AdminAnalyticsSummary>("/admin/analytics/summary", {
    method: "GET",
  });
}

export function getAdminReports(
  filters: AdminReportsFilters = {},
): Promise<AdminReportsResponse> {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.targetType) params.set("targetType", filters.targetType);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.cursor) params.set("cursor", filters.cursor);

  const query = params.toString();
  const path = query ? `/admin/reports?${query}` : "/admin/reports";

  return apiRequest<AdminReportsResponse>(path, { method: "GET" });
}

export function getAdminReportById(reportId: string): Promise<AdminReportResponse> {
  return apiRequest<AdminReportResponse>(`/admin/reports/${reportId}`, {
    method: "GET",
  });
}

export function updateAdminReportStatus(
  reportId: string,
  status: ReportStatus,
): Promise<AdminReportResponse> {
  return apiRequest<AdminReportResponse>(`/admin/reports/${reportId}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function getAdminFeedback(
  filters: AdminFeedbackFilters = {},
): Promise<AdminFeedbackResponse> {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.cursor) params.set("cursor", filters.cursor);

  const query = params.toString();
  const path = query ? `/admin/feedback?${query}` : "/admin/feedback";

  return apiRequest<AdminFeedbackResponse>(path, { method: "GET" });
}

export function updateAdminFeedbackStatus(
  feedbackId: string,
  status: FeedbackStatus,
): Promise<UpdateFeedbackStatusResponse> {
  return apiRequest<UpdateFeedbackStatusResponse>(
    `/admin/feedback/${feedbackId}/status`,
    {
      method: "PATCH",
      body: { status },
    },
  );
}

export function getAdminBetaCodes(): Promise<AdminBetaCodesResponse> {
  return apiRequest<AdminBetaCodesResponse>("/admin/beta-codes", {
    method: "GET",
  });
}

export function createAdminBetaCode(
  input: CreateBetaCodeInput,
): Promise<CreateBetaCodeResponse> {
  return apiRequest<CreateBetaCodeResponse>("/admin/beta-codes", {
    method: "POST",
    body: input,
  });
}

export type {
  AdminReport,
  AdminReportsFilters,
  AdminSummary,
  AdminAnalyticsSummary,
  ReportStatus,
  ReportTargetType,
} from "@/types/admin";

export type {
  AdminFeedbackItem,
  AdminFeedbackFilters,
  FeedbackStatus,
  FeedbackType,
  SubmitFeedbackInput,
} from "@/types/feedback";

export type {
  BetaAccessCode,
  PublicConfig,
} from "@/types/public";

export type { UserRole } from "@/types/admin";

export type {
  Friend,
  FriendActivityItem,
  FriendRequest,
  SendFriendRequestInput,
  UserSocialInfo,
} from "@/types/friend";

export type {
  DMConversation,
  DirectMessage,
  StartDirectConversationInput,
} from "@/types/dm";

export function sendFriendRequest(
  receiverHandle: string,
): Promise<{
  autoAccepted: boolean;
  request: FriendRequest;
  friendship?: { id: string; createdAt: string; friend: FriendUser };
}> {
  return apiRequest("/friends/requests", {
    method: "POST",
    body: { receiverHandle },
  });
}

export function getIncomingFriendRequests(): Promise<{ requests: FriendRequest[] }> {
  return apiRequest("/friends/requests/incoming", { method: "GET" });
}

export function getOutgoingFriendRequests(): Promise<{ requests: FriendRequest[] }> {
  return apiRequest("/friends/requests/outgoing", { method: "GET" });
}

export function acceptFriendRequest(requestId: string): Promise<{
  friendship: { id: string; createdAt: string; friend: FriendUser };
}> {
  return apiRequest(`/friends/requests/${requestId}/accept`, {
    method: "POST",
    body: {},
  });
}

export function rejectFriendRequest(requestId: string): Promise<{ request: { id: string; status: string } }> {
  return apiRequest(`/friends/requests/${requestId}/reject`, {
    method: "POST",
    body: {},
  });
}

export function cancelFriendRequest(requestId: string): Promise<{ request: { id: string; status: string } }> {
  return apiRequest(`/friends/requests/${requestId}/cancel`, {
    method: "POST",
    body: {},
  });
}

export function getFriends(): Promise<{ friends: Friend[] }> {
  return apiRequest("/friends", { method: "GET" });
}

export function getFriendsActivity(): Promise<{ friends: FriendActivityItem[] }> {
  return apiRequest("/friends/activity", { method: "GET" });
}

export function getUserSocialInfo(handle: string): Promise<UserSocialInfo> {
  return apiRequest<UserSocialInfo>(`/users/${encodeURIComponent(handle)}/social`, {
    method: "GET",
  });
}

export function getDashboard(): Promise<DashboardResponse> {
  return apiRequest<DashboardResponse>("/dashboard", { method: "GET" });
}

export function removeFriend(userId: string): Promise<{ message: string }> {
  return apiRequest(`/friends/${userId}`, { method: "DELETE" });
}

export function getDmConversations(): Promise<{ conversations: DMConversation[] }> {
  return apiRequest("/dm/conversations", { method: "GET" });
}

export function startDirectConversation(
  input: StartDirectConversationInput,
): Promise<{ conversation: DMConversation }> {
  return apiRequest("/dm/conversations/direct", {
    method: "POST",
    body: input,
  });
}

export function getDmMessages(
  conversationId: string,
  query: { limit?: number; before?: string } = {},
): Promise<{ messages: DirectMessage[]; nextCursor: string | null }> {
  const params = new URLSearchParams();

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.before) {
    params.set("before", query.before);
  }

  const suffix = params.toString();
  const path = suffix
    ? `/dm/conversations/${conversationId}/messages?${suffix}`
    : `/dm/conversations/${conversationId}/messages`;

  return apiRequest(path, { method: "GET" });
}

export function sendDmMessage(
  conversationId: string,
  content: string,
): Promise<{ message: DirectMessage }> {
  return apiRequest(`/dm/conversations/${conversationId}/messages`, {
    method: "POST",
    body: { content },
  });
}

export function deleteDmMessage(
  conversationId: string,
  messageId: string,
): Promise<{ message: string }> {
  return apiRequest(`/dm/conversations/${conversationId}/messages/${messageId}`, {
    method: "DELETE",
  });
}

export type {
  Notification,
  NotificationsResponse,
  NotificationType,
} from "@/types/notification";

export function getNotifications(
  query: {
    limit?: number;
    unreadOnly?: boolean;
    type?: NotificationType;
    types?: string;
    cursor?: string;
  } = {},
): Promise<NotificationsResponse> {
  const params = new URLSearchParams();

  if (query.limit) {
    params.set("limit", String(query.limit));
  }

  if (query.unreadOnly) {
    params.set("unreadOnly", "true");
  }

  if (query.type) {
    params.set("type", query.type);
  }

  if (query.types) {
    params.set("types", query.types);
  }

  if (query.cursor) {
    params.set("cursor", query.cursor);
  }

  const suffix = params.toString();
  const path = suffix ? `/notifications?${suffix}` : "/notifications";

  return apiRequest(path, { method: "GET" });
}

export function getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
  return apiRequest("/notifications/unread-count", { method: "GET" });
}

export function markNotificationAsRead(
  notificationId: string,
): Promise<{ notification: Notification }> {
  return apiRequest(`/notifications/${notificationId}/read`, {
    method: "PATCH",
    body: {},
  });
}

export function markAllNotificationsAsRead(): Promise<{ updatedCount: number }> {
  return apiRequest("/notifications/read-all", {
    method: "PATCH",
    body: {},
  });
}

export function deleteNotification(
  notificationId: string,
): Promise<{ message: string }> {
  return apiRequest(`/notifications/${notificationId}`, {
    method: "DELETE",
  });
}

export function deleteAllNotifications(
  body: { onlyRead?: boolean } = {},
): Promise<{ deletedCount: number }> {
  return apiRequest("/notifications", {
    method: "DELETE",
    body,
  });
}

export function getCommunities(
  filters: CommunityFilters = {},
): Promise<CommunityListResponse> {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.category) params.set("category", filters.category);
  if (filters.visibility) params.set("visibility", filters.visibility);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.cursor) params.set("cursor", filters.cursor);
  const suffix = params.toString();
  return apiRequest(suffix ? `/communities?${suffix}` : "/communities");
}

export function createCommunity(
  data: CreateCommunityInput,
): Promise<CommunityDetailResponse> {
  return apiRequest("/communities", { method: "POST", body: data });
}

export function getCommunityById(communityId: string): Promise<CommunityDetailResponse> {
  return apiRequest(`/communities/${communityId}`);
}

export function joinCommunity(communityId: string): Promise<CommunityDetailResponse> {
  return apiRequest(`/communities/${communityId}/join`, { method: "POST", body: {} });
}

export function leaveCommunity(communityId: string): Promise<{ message: string }> {
  return apiRequest(`/communities/${communityId}/leave`, { method: "POST", body: {} });
}

export function createCommunityChannel(
  communityId: string,
  data: CreateChannelInput,
): Promise<{ channel: CommunityChannel }> {
  return apiRequest(`/communities/${communityId}/channels`, {
    method: "POST",
    body: data,
  });
}

export function getCommunityChannel(
  communityId: string,
  channelId: string,
): Promise<{
  channel: CommunityChannel;
  community: CommunityDetailResponse["community"];
  isMember: boolean;
  currentUserRole: CommunityDetailResponse["currentUserRole"];
  members: CommunityDetailResponse["members"];
}> {
  return apiRequest(`/communities/${communityId}/channels/${channelId}`);
}

export function createCommunityInvite(
  communityId: string,
  data: CreateCommunityInviteInput = {},
): Promise<{ invite: CommunityInvite }> {
  return apiRequest(`/communities/${communityId}/invites`, {
    method: "POST",
    body: data,
  });
}

export function getCommunityInvites(
  communityId: string,
): Promise<{ invites: CommunityInvite[] }> {
  return apiRequest(`/communities/${communityId}/invites`);
}

export function revokeCommunityInvite(
  communityId: string,
  inviteId: string,
): Promise<{ message: string }> {
  return apiRequest(`/communities/${communityId}/invites/${inviteId}`, {
    method: "DELETE",
  });
}

export function getCommunityInvitePreview(code: string): Promise<CommunityInvitePreview> {
  return apiRequest(`/community-invites/${encodeURIComponent(code)}`);
}

export function acceptCommunityInvite(code: string): Promise<CommunityDetailResponse> {
  return apiRequest(`/community-invites/${encodeURIComponent(code)}/accept`, {
    method: "POST",
    body: {},
  });
}
