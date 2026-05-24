import type { PresenceStatus } from "@/lib/api";
import type { RoomCategory, RoomType } from "@/types/room";

export type FriendRequestStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED";

export type FriendshipRelationStatus =
  | "FRIENDS"
  | "PENDING_SENT"
  | "PENDING_RECEIVED"
  | "NONE";

export interface FriendUser {
  id: string;
  username: string;
  handle: string;
  avatarUrl: string | null;
  presenceStatus: PresenceStatus;
  statusMessage: string | null;
  lastSeenAt: string | null;
}

export interface Friend extends FriendUser {
  friendshipCreatedAt: string;
}

export interface FriendActivityRoom {
  id: string;
  name: string;
  category: RoomCategory;
  type: RoomType;
}

export interface FriendActivityItem extends FriendUser {
  currentRoom: FriendActivityRoom | null;
  isRoomMember: boolean;
}

export interface UserSocialInfo {
  isFriend: boolean;
  friendshipStatus: FriendshipRelationStatus;
  mutualFriendsCount: number;
  mutualFriends: FriendUser[];
}

export interface FriendRequest {
  id: string;
  status: FriendRequestStatus;
  createdAt: string;
  sender?: FriendUser;
  receiver?: FriendUser;
}

export interface SendFriendRequestInput {
  receiverHandle: string;
}
