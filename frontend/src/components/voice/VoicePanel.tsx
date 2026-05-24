"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitVoiceRoom } from "@/components/voice/LiveKitVoiceRoom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, requestVoiceToken } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { VoiceTokenResponse } from "@/types/voice";

interface VoicePanelProps {
  roomId: string;
  isMember: boolean;
  startMicMuted?: boolean;
}

export function VoicePanel({
  roomId,
  isMember,
  startMicMuted = false,
}: VoicePanelProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [session, setSession] = useState<VoiceTokenResponse | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSession(null);
    setStatusMessage(null);
    setErrorMessage(null);
  }, [roomId]);

  const handleJoin = useCallback(async () => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    if (!isMember) {
      setErrorMessage(t("voice.memberRequired"));
      return;
    }

    setJoinLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const tokenResponse = await requestVoiceToken(roomId);
      setSession(tokenResponse);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : t("voice.connectionFailed"),
      );
    } finally {
      setJoinLoading(false);
    }
  }, [isMember, roomId, router, t]);

  const handleConnected = useCallback(() => {
    setStatusMessage(t("voice.connectionReady"));
    setErrorMessage(null);
  }, [t]);

  const handleDisconnected = useCallback(() => {
    setSession(null);
    setStatusMessage(t("voice.disconnected"));
    setErrorMessage(null);
  }, [t]);

  const handleVoiceError = useCallback(
    (message: string) => {
      setErrorMessage(message);
    },
    [],
  );

  const isAuthenticated = Boolean(getToken());

  return (
    <Card glow className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold">{t("voice.title")}</h2>
        <p className="mt-1 text-xs text-muted">{t("voice.subtitle")}</p>
      </div>

      {!isMember ? (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {t("voice.memberRequired")}
        </p>
      ) : null}

      {!isAuthenticated ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
          {t("voice.loginRequired")}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {errorMessage}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-xs text-accent-foreground">
          {statusMessage}
        </p>
      ) : null}

      {session ? (
        <LiveKitVoiceRoom
          token={session.token}
          livekitUrl={session.livekitUrl}
          startMicMuted={startMicMuted}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
          onError={handleVoiceError}
        />
      ) : (
        <Button
          onClick={() => void handleJoin()}
          disabled={!isMember || !isAuthenticated || joinLoading}
          size="lg"
          className="w-full sm:max-w-xs"
        >
          {joinLoading ? t("voice.joining") : t("voice.join")}
        </Button>
      )}
    </Card>
  );
}
