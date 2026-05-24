export interface NotificationPreferences {
  notifyFriendRequests: boolean;
  notifyFriendAccepted: boolean;
  notifyDmMessages: boolean;
  notifyRoomModeration: boolean;
  notifyRoomActivity: boolean;
  notifySystem: boolean;
}

export interface UpdatePreferencesInput {
  notifyFriendRequests?: boolean;
  notifyFriendAccepted?: boolean;
  notifyDmMessages?: boolean;
  notifyRoomModeration?: boolean;
  notifyRoomActivity?: boolean;
  notifySystem?: boolean;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export type SettingsSection =
  | "account"
  | "profile"
  | "premium"
  | "notifications"
  | "security"
  | "language"
  | "danger";
