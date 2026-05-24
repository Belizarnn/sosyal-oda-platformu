"use client";

import { useState } from "react";
import { InviteLinkBox } from "@/components/invites/InviteLinkBox";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  regenerateRoomInvite,
  updateInviteSettings,
} from "@/lib/api";
import type { InviteSettings } from "@/types/invite";

interface InviteSettingsPanelProps {
  roomId: string;
  inviteCode: string;
  inviteEnabled: boolean;
  canManageSettings: boolean;
  onUpdated: (settings: InviteSettings) => void;
}

export function InviteSettingsPanel({
  roomId,
  inviteCode,
  inviteEnabled,
  canManageSettings,
  onUpdated,
}: InviteSettingsPanelProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState<"regenerate" | "toggle" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRegenerate() {
    setLoading("regenerate");
    setError(null);

    try {
      const settings = await regenerateRoomInvite(roomId);
      onUpdated(settings);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("invite.regenerateFailed"));
    } finally {
      setLoading(null);
    }
  }

  async function handleToggle() {
    setLoading("toggle");
    setError(null);

    try {
      const settings = await updateInviteSettings(roomId, !inviteEnabled);
      onUpdated(settings);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("invite.settingsUpdateFailed"));
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card glow className="space-y-4">
      <InviteLinkBox inviteCode={inviteCode} inviteEnabled={inviteEnabled} />

      {canManageSettings ? (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t("invite.enabledToggle")}</span>
            <button
              type="button"
              role="switch"
              aria-checked={inviteEnabled}
              onClick={handleToggle}
              disabled={loading !== null}
              className={`relative h-7 w-12 rounded-full transition ${
                inviteEnabled ? "bg-accent/80" : "bg-surface"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${
                  inviteEnabled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </label>

          <Button
            type="button"
            variant="secondary"
            onClick={handleRegenerate}
            disabled={loading !== null}
          >
            {loading === "regenerate" ? t("invite.regenerating") : t("invite.regenerate")}
          </Button>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
        </div>
      ) : null}
    </Card>
  );
}
