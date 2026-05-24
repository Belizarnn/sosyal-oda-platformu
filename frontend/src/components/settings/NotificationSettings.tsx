"use client";

import { NotificationPreferencesPanel } from "@/components/notifications/NotificationPreferencesPanel";
import type { AuthUser } from "@/lib/api";
import type { NotificationPreferences } from "@/types/settings";

interface NotificationSettingsProps {
  user: AuthUser;
  onPreferencesUpdated: (preferences: NotificationPreferences) => void;
}

export function NotificationSettings({
  user,
  onPreferencesUpdated,
}: NotificationSettingsProps) {
  return (
    <NotificationPreferencesPanel
      initialPreferences={{
        notifyFriendRequests: user.notifyFriendRequests ?? true,
        notifyFriendAccepted: user.notifyFriendAccepted ?? true,
        notifyDmMessages: user.notifyDmMessages ?? true,
        notifyRoomModeration: user.notifyRoomModeration ?? true,
        notifyRoomActivity: user.notifyRoomActivity ?? true,
        notifySystem: user.notifySystem ?? true,
      }}
      onPreferencesUpdated={onPreferencesUpdated}
    />
  );
}
