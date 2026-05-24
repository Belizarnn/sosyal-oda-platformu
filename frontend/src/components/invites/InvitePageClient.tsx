"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { InvitePreviewCard } from "@/components/invites/InvitePreviewCard";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import {
  ApiError,
  getInvitePreview,
  getRoomById,
  joinRoom,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { InvitePreview } from "@/types/invite";

interface InvitePageClientProps {
  inviteCode: string;
}

export function InvitePageClient({ inviteCode }: InvitePageClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [isMember, setIsMember] = useState(false);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getInvitePreview(inviteCode, getToken());
      setPreview(response);

      if (getToken()) {
        try {
          const roomDetail = await getRoomById(response.room.id);
          setIsMember(roomDetail.isMember);
        } catch {
          setIsMember(false);
        }
      }
    } catch (err) {
      setPreview(null);
      setError(
        err instanceof ApiError ? err.message : t("invite.invalidDesc"),
      );
    } finally {
      setLoading(false);
    }
  }, [inviteCode, t]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  async function handleJoin() {
    if (!preview) {
      return;
    }

    setJoinLoading(true);
    setJoinError(null);

    try {
      await joinRoom(preview.room.id, {
        inviteCode,
        password: preview.requiresPassword ? password : undefined,
      });
      router.push(`/rooms/${preview.room.id}`);
    } catch (err) {
      setJoinError(err instanceof ApiError ? err.message : t("invite.joinFailed"));
    } finally {
      setJoinLoading(false);
    }
  }

  if (loading) {
    return (
      <LoadingSpinner label={t("states.loading.invite")} className="min-h-[50vh]" />
    );
  }

  if (error || !preview) {
    return (
      <div className="mx-auto max-w-lg">
        <ErrorState
          title={t("states.error.inviteInvalid")}
          description={error ?? t("invite.invalidDesc")}
          onRetry={() => void loadPreview()}
        />
      </div>
    );
  }

  return (
    <InvitePreviewCard
      preview={preview}
      inviteCode={inviteCode}
      isLoggedIn={Boolean(user && getToken())}
      isMember={isMember}
      loading={joinLoading}
      error={joinError}
      password={password}
      onPasswordChange={setPassword}
      onJoin={handleJoin}
    />
  );
}
