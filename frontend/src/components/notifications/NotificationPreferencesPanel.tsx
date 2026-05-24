"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api";
import type { NotificationPreferences } from "@/types/settings";

interface NotificationPreferencesPanelProps {
  initialPreferences?: NotificationPreferences;
  onPreferencesUpdated?: (preferences: NotificationPreferences) => void;
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4">
      <div>
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          checked ? "bg-accent/80" : "bg-surface"
        } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  notifyFriendRequests: true,
  notifyFriendAccepted: true,
  notifyDmMessages: true,
  notifyRoomModeration: true,
  notifyRoomActivity: true,
  notifySystem: true,
};

export function NotificationPreferencesPanel({
  initialPreferences,
  onPreferencesUpdated,
}: NotificationPreferencesPanelProps) {
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    initialPreferences ?? DEFAULT_PREFERENCES,
  );
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialPreferences);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialPreferences) {
      setPreferences(initialPreferences);
      setLoading(false);
      return;
    }

    async function loadPreferences() {
      setLoading(true);
      setError(null);

      try {
        const response = await getNotificationPreferences();
        setPreferences(response.preferences);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : t("settings.notifications.updateFailed"),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPreferences();
  }, [initialPreferences, t]);

  async function handleToggle(
    key: keyof NotificationPreferences,
    value: boolean,
  ) {
    const previous = preferences;
    const next = { ...preferences, [key]: value };

    setPreferences(next);
    setLoadingKey(key);
    setError(null);

    try {
      const response = await updateNotificationPreferences({ [key]: value });
      setPreferences(response.preferences);
      onPreferencesUpdated?.(response.preferences);
    } catch (err) {
      setPreferences(previous);
      setError(
        err instanceof ApiError
          ? err.message
          : t("settings.notifications.updateFailed"),
      );
    } finally {
      setLoadingKey(null);
    }
  }

  if (loading) {
    return (
      <Card glow className="p-5">
        <p className="text-sm text-muted">{t("common.loading")}</p>
      </Card>
    );
  }

  return (
    <Card glow className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("settings.notifications.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("settings.notifications.subtitle")}</p>
      </div>

      <div className="space-y-3">
        <ToggleRow
          label={t("settings.notifications.friendRequests")}
          description={t("settings.notifications.friendRequestsDesc")}
          checked={preferences.notifyFriendRequests}
          disabled={loadingKey === "notifyFriendRequests"}
          onChange={(value) => void handleToggle("notifyFriendRequests", value)}
        />
        <ToggleRow
          label={t("settings.notifications.friendAccepted")}
          description={t("settings.notifications.friendAcceptedDesc")}
          checked={preferences.notifyFriendAccepted}
          disabled={loadingKey === "notifyFriendAccepted"}
          onChange={(value) => void handleToggle("notifyFriendAccepted", value)}
        />
        <ToggleRow
          label={t("settings.notifications.dmMessages")}
          description={t("settings.notifications.dmMessagesDesc")}
          checked={preferences.notifyDmMessages}
          disabled={loadingKey === "notifyDmMessages"}
          onChange={(value) => void handleToggle("notifyDmMessages", value)}
        />
        <ToggleRow
          label={t("settings.notifications.roomActivity")}
          description={t("settings.notifications.roomActivityDesc")}
          checked={preferences.notifyRoomActivity}
          disabled={loadingKey === "notifyRoomActivity"}
          onChange={(value) => void handleToggle("notifyRoomActivity", value)}
        />
        <ToggleRow
          label={t("settings.notifications.roomModeration")}
          description={t("settings.notifications.roomModerationDesc")}
          checked={preferences.notifyRoomModeration}
          disabled={loadingKey === "notifyRoomModeration"}
          onChange={(value) => void handleToggle("notifyRoomModeration", value)}
        />
        <ToggleRow
          label={t("settings.notifications.system")}
          description={t("settings.notifications.systemDesc")}
          checked={preferences.notifySystem}
          disabled={loadingKey === "notifySystem"}
          onChange={(value) => void handleToggle("notifySystem", value)}
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </Card>
  );
}
