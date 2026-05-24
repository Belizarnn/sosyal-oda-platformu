"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ApiError,
  createCommunityInvite,
  getCommunityInvites,
  revokeCommunityInvite,
} from "@/lib/api";
import { APP_BASE_URL } from "@/lib/env";
import type { CommunityInvite } from "@/types/community";

interface CommunityInviteModalProps {
  communityId: string;
  open: boolean;
  onClose: () => void;
}

export function CommunityInviteModal({
  communityId,
  open,
  onClose,
}: CommunityInviteModalProps) {
  const { t } = useLanguage();
  const { success } = useToast();
  const [invites, setInvites] = useState<CommunityInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await getCommunityInvites(communityId);
        setInvites(response.invites.filter((invite) => invite.isActive));
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("states.error.loadFailed"));
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [communityId, open, t]);

  async function handleCreate() {
    setCreating(true);
    try {
      const response = await createCommunityInvite(communityId, {});
      setInvites((current) => [response.invite, ...current]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.inviteFailed"));
    } finally {
      setCreating(false);
    }
  }

  async function handleCopy(code: string) {
    const url = `${APP_BASE_URL.replace(/\/$/, "")}/invite/community/${code}`;
    try {
      await navigator.clipboard.writeText(url);
      success(t("invite.copySuccess"));
    } catch {
      // clipboard unavailable
    }
  }

  async function handleRevoke(inviteId: string) {
    try {
      await revokeCommunityInvite(communityId, inviteId);
      setInvites((current) => current.filter((invite) => invite.id !== inviteId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.inviteRevokeFailed"));
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-[var(--overlay)]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-dropdown p-5">
        <h2 className="text-lg font-semibold">{t("communities.invite")}</h2>
        <p className="mt-1 text-sm text-muted">{t("communities.inviteDesc")}</p>

        <div className="mt-4 space-y-3">
          <Button onClick={() => void handleCreate()} disabled={creating} className="w-full">
            {creating ? t("common.loading") : t("communities.createInvite")}
          </Button>

          {loading ? <p className="text-sm text-muted">{t("common.loading")}</p> : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface p-2"
              >
                <code className="min-w-0 flex-1 truncate text-xs">{invite.code}</code>
                <Button size="sm" variant="secondary" onClick={() => void handleCopy(invite.code)}>
                  {t("rooms.inviteCopy")}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => void handleRevoke(invite.id)}
                >
                  {t("communities.revokeInvite")}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <Button variant="secondary" onClick={onClose} className="mt-4 w-full">
          {t("common.close")}
        </Button>
      </div>
    </div>
  );
}
