import type { Friend } from "@/types/friend";
import type { Notification } from "@/types/notification";
import type { RoomListItem } from "@/types/room";

export interface DashboardContinueRoom {
  id: string;
  name: string;
  category: RoomListItem["category"];
  description: string | null;
  currentUserCount: number;
  maxUserCount: number;
  isMember: boolean;
}

export interface DashboardFriendInRoom {
  friend: Pick<
    Friend,
    "id" | "username" | "handle" | "avatarUrl" | "presenceStatus" | "statusMessage"
  >;
  room: {
    id: string;
    name: string;
    category: RoomListItem["category"];
    currentUserCount: number;
  };
  isMember: boolean;
}

export interface DashboardQuickStats {
  roomsJoined: number;
  friendsCount: number;
  unreadNotifications: number;
}

export interface DashboardResponse {
  continueRoom: DashboardContinueRoom | null;
  recommendedRooms: RoomListItem[];
  friendsInRooms: DashboardFriendInRoom[];
  onlineFriends: Friend[];
  recentNotifications: Notification[];
  quickStats: DashboardQuickStats;
}
