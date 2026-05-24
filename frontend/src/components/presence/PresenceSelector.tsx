"use client";

import { useState } from "react";
import { PresenceDot } from "@/components/presence/PresenceDot";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, updatePresence, type AuthUser } from "@/lib/api";
import { updateStoredUser } from "@/lib/auth";
import {
  getPresenceLabel,
  getPresenceMeta,
  SELECTABLE_PRESENCE_STATUSES,
  type PresenceStatusValue,
} from "@/lib/presence";
import { cn } from "@/lib/cn";

interface PresenceSelectorProps {
  user: AuthUser;
  onUpdated: (user: AuthUser) => void;
}

export function PresenceSelector({ user, onUpdated }: PresenceSelectorProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(nextStatus: PresenceStatusValue) {
    if (nextStatus === user.presenceStatus || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user: updatedUser } = await updatePresence({
        presenceStatus: nextStatus,
        statusMessage: user.statusMessage,
      });
      updateStoredUser(updatedUser);
      onUpdated(updatedUser);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("presence.updateFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  const currentMeta = getPresenceMeta(user.presenceStatus);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted">
        <PresenceDot status={user.presenceStatus} />
        <span>
          {t("presence.current")}{" "}
          <span className={currentMeta.textClass}>
            {getPresenceLabel(user.presenceStatus, t)}
          </span>
        </span>
        {loading ? <span className="text-xs">{t("common.saving")}</span> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {SELECTABLE_PRESENCE_STATUSES.map((status) => {
          const meta = getPresenceMeta(status);
          const active = user.presenceStatus === status;

          return (
            <button
              key={status}
              type="button"
              disabled={loading}
              onClick={() => handleSelect(status)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition disabled:cursor-not-allowed disabled:opacity-60",
                active
                  ? "border-accent/40 bg-accent/15 text-foreground shadow-[0_0_16px_var(--glow)]"
                  : "border-border bg-surface text-muted hover:border-border hover:text-foreground",
              )}
            >
              <PresenceDot status={status} className="h-2 w-2" />
              {getPresenceLabel(status, t)}
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
