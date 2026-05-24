"use client";

import { useCallback, useEffect, useState } from "react";
import { AddToQueueForm } from "@/components/watch/AddToQueueForm";
import { AssistedExternalSyncPanel } from "@/components/watch/players/AssistedExternalSyncPanel";
import { ExternalSyncPlayer } from "@/components/watch/players/ExternalSyncPlayer";
import { KickWatchPlayer } from "@/components/watch/players/KickWatchPlayer";
import { TwitchWatchPlayer } from "@/components/watch/players/TwitchWatchPlayer";
import { YouTubeWatchPlayer } from "@/components/watch/players/YouTubeWatchPlayer";
import { WatchControls } from "@/components/watch/WatchControls";
import { WatchHostBadge } from "@/components/watch/WatchHostBadge";
import { WatchMediaForm } from "@/components/watch/WatchMediaForm";
import { WatchModeBadge } from "@/components/watch/WatchModeBadge";
import { WatchProviderSelector } from "@/components/watch/WatchProviderSelector";
import { WatchQueue } from "@/components/watch/WatchQueue";
import { WatchViewerList } from "@/components/watch/WatchViewerList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ExternalSyncCommandPayload } from "@/lib/assistedExternalSync";
import { isAssistedExternalSyncMode } from "@/lib/assistedExternalSync";
import {
  ApiError,
  addToWatchQueue,
  controlWatch,
  getWatchQueue,
  getWatchState,
  playWatchQueueItem,
  removeFromWatchQueue,
  setWatchMedia,
  setWatchReady,
  setWatchVideo,
  startWatchCountdown,
  takeWatchHost,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { AppSocket } from "@/lib/socket";
import type { RoomMember, RoomMemberRole } from "@/types/room";
import type {
  MediaProvider,
  RoomMediaState,
  SetWatchMediaInput,
  WatchQueueItem,
  WatchReadyUser,
} from "@/types/watch";
import { getProviderLabel } from "@/types/watch";

interface WatchPartyPanelProps {
  roomId: string;
  isMember: boolean;
  currentUserId?: string | null;
  currentUserRole?: RoomMemberRole | null;
  members: RoomMember[];
  socket: AppSocket | null;
}

function formatCommandTime(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function WatchPartyPanel({
  roomId,
  isMember,
  currentUserId,
  currentUserRole,
  members,
  socket,
}: WatchPartyPanelProps) {
  const { t } = useLanguage();
  const { success } = useToast();
  const [mediaState, setMediaState] = useState<RoomMediaState | null>(null);
  const [readyUsers, setReadyUsers] = useState<WatchReadyUser[]>([]);
  const [queue, setQueue] = useState<WatchQueueItem[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<MediaProvider>("YOUTUBE");
  const [showMediaSetup, setShowMediaSetup] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [syncKey, setSyncKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const applyMediaState = useCallback((state: RoomMediaState) => {
    setMediaState(state);
    setCurrentTime(state.currentTime);
    setIsPlaying(state.isPlaying);
    setSelectedProvider(state.provider);
    setShowMediaSetup(false);
  }, []);

  const loadWatchData = useCallback(async () => {
    if (!isMember || !getToken()) {
      setMediaState(null);
      setReadyUsers([]);
      setQueue([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [stateResponse, queueResponse] = await Promise.all([
        getWatchState(roomId),
        getWatchQueue(roomId),
      ]);

      if (stateResponse.mediaState) {
        applyMediaState(stateResponse.mediaState);
      } else {
        setMediaState(null);
        setShowMediaSetup(true);
      }

      setReadyUsers(stateResponse.readyUsers ?? []);
      setQueue(queueResponse.queue);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [applyMediaState, isMember, roomId, t]);

  useEffect(() => {
    void loadWatchData();
  }, [loadWatchData]);

  useEffect(() => {
    if (!socket || !isMember) {
      return;
    }

    socket.emit("watch:join", { roomId });

    const handleStateUpdated = (state: RoomMediaState) => {
      if (state.roomId !== roomId) {
        return;
      }
      applyMediaState(state);
    };

    const handleReadyUpdated = (payload: { roomId: string; readyUsers: WatchReadyUser[] }) => {
      if (payload.roomId !== roomId) {
        return;
      }
      setReadyUsers(payload.readyUsers);
    };

    const handleExternalSyncCommand = (payload: ExternalSyncCommandPayload) => {
      if (payload.roomId !== roomId) {
        return;
      }

      const platform = getProviderLabel(payload.provider);
      const timeLabel = formatCommandTime(payload.currentTime);

      if (payload.command === "SEEK") {
        setSyncNotice(t(payload.messageKey, { time: timeLabel, platform }));
        return;
      }

      setSyncNotice(t(payload.messageKey, { platform }));
    };

    const handleExternalSyncStatusUpdated = (state: RoomMediaState) => {
      if (state.roomId !== roomId) {
        return;
      }
      applyMediaState(state);
    };

    const handleCountdownStarted = (payload: {
      roomId: string;
      countdownEndsAt: string;
    }) => {
      if (payload.roomId !== roomId) {
        return;
      }
      setMediaState((prev) =>
        prev ? { ...prev, countdownEndsAt: payload.countdownEndsAt } : prev,
      );
    };

    const handleQueueUpdated = (payload: { roomId: string; queue: WatchQueueItem[] }) => {
      if (payload.roomId !== roomId) {
        return;
      }
      setQueue(payload.queue);
    };

    const handleSync = (payload: {
      roomId: string;
      action: "PLAY" | "PAUSE" | "SEEK" | "START_TIMER";
      currentTime: number;
      isPlaying: boolean;
    }) => {
      if (payload.roomId !== roomId) {
        return;
      }

      setCurrentTime(payload.currentTime);
      setIsPlaying(payload.isPlaying);
      setMediaState((prev) =>
        prev
          ? {
              ...prev,
              currentTime: payload.currentTime,
              isPlaying: payload.isPlaying,
            }
          : prev,
      );

      if (payload.action === "SEEK" || payload.action === "PLAY" || payload.action === "START_TIMER") {
        setSyncKey((value) => value + 1);
      }
    };

    const handleError = (payload: { message: string }) => {
      setError(payload.message);
    };

    socket.on("watch:state-updated", handleStateUpdated);
    socket.on("watch:ready-updated", handleReadyUpdated);
    socket.on("ready_state_updated", handleReadyUpdated);
    socket.on("watch:countdown-started", handleCountdownStarted);
    socket.on("watch_countdown_started", handleCountdownStarted);
    socket.on("watch:queue-updated", handleQueueUpdated);
    socket.on("watch:sync", handleSync);
    socket.on("external_sync_command_sent", handleExternalSyncCommand);
    socket.on("external_sync_status_updated", handleExternalSyncStatusUpdated);
    socket.on("watch:error", handleError);

    return () => {
      socket.off("watch:state-updated", handleStateUpdated);
      socket.off("watch:ready-updated", handleReadyUpdated);
      socket.off("ready_state_updated", handleReadyUpdated);
      socket.off("watch:countdown-started", handleCountdownStarted);
      socket.off("watch_countdown_started", handleCountdownStarted);
      socket.off("watch:queue-updated", handleQueueUpdated);
      socket.off("watch:sync", handleSync);
      socket.off("external_sync_command_sent", handleExternalSyncCommand);
      socket.off("external_sync_status_updated", handleExternalSyncStatusUpdated);
      socket.off("watch:error", handleError);
    };
  }, [applyMediaState, isMember, roomId, socket, t]);

  async function emitOrRequest<T>(
    event:
      | "watch:set-video"
      | "watch:set-media"
      | "watch:play"
      | "watch:pause"
      | "watch:seek"
      | "watch:ready"
      | "watch:countdown-start",
    payload: Record<string, unknown>,
    fallback: () => Promise<T>,
  ): Promise<T> {
    if (socket) {
      return new Promise<T>((resolve, reject) => {
        socket.emit(
          event,
          payload as never,
          (response: {
            ok?: boolean;
            message?: string;
            mediaState?: RoomMediaState;
            readyUsers?: WatchReadyUser[];
          }) => {
            if (response?.ok) {
              if (response.mediaState) {
                applyMediaState(response.mediaState);
              }
              if (response.readyUsers) {
                setReadyUsers(response.readyUsers);
              }
              resolve(response as T);
              return;
            }

            reject(new Error(response?.message ?? t("notifications.actionFailed")));
          },
        );
      });
    }

    return fallback();
  }

  async function handleSetMedia(data: SetWatchMediaInput) {
    setActionLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await emitOrRequest(
        data.provider === "YOUTUBE" && data.url && !data.externalTitle
          ? "watch:set-video"
          : "watch:set-media",
        data.provider === "YOUTUBE" && data.url
          ? { roomId, videoUrl: data.url }
          : { roomId, ...data },
        () =>
          data.provider === "YOUTUBE" && data.url
            ? setWatchVideo(roomId, data.url)
            : setWatchMedia(roomId, data),
      );

      if ("mediaState" in response && response.mediaState) {
        applyMediaState(response.mediaState);
        setReadyUsers([]);
        success(
          data.provider === "YOUTUBE"
            ? t("watch.videoStarted")
            : t("watch.assisted.sessionStarted"),
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.videoStartFailed"));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAddToQueue(videoUrl: string) {
    setActionLoading(true);
    setError(null);

    try {
      await addToWatchQueue(roomId, videoUrl);
      const queueResponse = await getWatchQueue(roomId);
      setQueue(queueResponse.queue);
      success(t("watch.queueAdded"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.queueAddFailed"));
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePlayQueueItem(itemId: string) {
    setActionLoading(true);
    setError(null);

    try {
      const response = await playWatchQueueItem(roomId, itemId);
      applyMediaState(response.mediaState);
      setReadyUsers([]);
      const queueResponse = await getWatchQueue(roomId);
      setQueue(queueResponse.queue);
      success(t("watch.videoStarted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.videoStartFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRemoveQueueItem(itemId: string) {
    setActionLoading(true);
    setError(null);

    try {
      await removeFromWatchQueue(roomId, itemId);
      setQueue((current) => current.filter((item) => item.id !== itemId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.queueRemoveFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePlay() {
    setActionLoading(true);
    setError(null);

    try {
      await emitOrRequest(
        "watch:play",
        { roomId, currentTime },
        () => controlWatch(roomId, "PLAY", currentTime),
      );
      setIsPlaying(true);
      setSyncKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.playFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePause() {
    setActionLoading(true);
    setError(null);

    try {
      await emitOrRequest(
        "watch:pause",
        { roomId, currentTime },
        () => controlWatch(roomId, "PAUSE", currentTime),
      );
      setIsPlaying(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.pauseFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSeek(time: number) {
    const safeTime = Math.max(0, time);
    setCurrentTime(safeTime);
    setActionLoading(true);
    setError(null);

    try {
      await emitOrRequest(
        "watch:seek",
        { roomId, currentTime: safeTime },
        () => controlWatch(roomId, "SEEK", safeTime),
      );
      setSyncKey((value) => value + 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.seekFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleTakeHost() {
    setActionLoading(true);
    setError(null);

    try {
      const response = await takeWatchHost(roomId);
      applyMediaState(response.mediaState);
      setStatusMessage(t("watch.takeHostSuccess"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("watch.takeHostFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleReady(isReady: boolean) {
    setActionLoading(true);
    setError(null);

    try {
      await emitOrRequest(
        "watch:ready",
        { roomId, isReady },
        () => setWatchReady(roomId, isReady),
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Hazır olma güncellenemedi.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleStartCountdown(seconds: 3 | 5 | 10) {
    setActionLoading(true);
    setError(null);

    try {
      const response = await emitOrRequest(
        "watch:countdown-start",
        { roomId, seconds },
        () => startWatchCountdown(roomId, seconds),
      );

      if ("countdownEndsAt" in response && typeof response.countdownEndsAt === "string") {
        setMediaState((prev) =>
          prev ? { ...prev, countdownEndsAt: response.countdownEndsAt as string } : prev,
        );
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Geri sayım başlatılamadı.");
    } finally {
      setActionLoading(false);
    }
  }

  const isHost = Boolean(
    mediaState && currentUserId && mediaState.hostUserId === currentUserId,
  );
  const canChangeMedia = Boolean(
    isHost ||
      currentUserRole === "OWNER" ||
      currentUserRole === "MODERATOR",
  );
  const isAuthenticated = Boolean(getToken());
  const visibleQueue = queue.filter(
    (item) => item.status !== "PLAYED" && item.status !== "REMOVED",
  );
  const displayTitle =
    mediaState?.externalTitle ??
    mediaState?.title ??
    mediaState?.videoId ??
    "Watch Party";
  const socialStatus = mediaState
    ? isPlaying
      ? t("watch.socialPlaying", { title: displayTitle })
      : t("watch.socialPaused", { title: displayTitle })
    : t("watch.socialIdle");

  function renderEmbedPlayer() {
    if (!mediaState) {
      return null;
    }

    switch (mediaState.provider) {
      case "YOUTUBE":
        if (!mediaState.videoId) {
          return null;
        }
        return (
          <YouTubeWatchPlayer
            videoId={mediaState.videoId}
            currentTime={currentTime}
            isPlaying={isPlaying}
            syncKey={syncKey}
          />
        );
      case "TWITCH":
        if (!mediaState.videoId) {
          return null;
        }
        return <TwitchWatchPlayer channel={mediaState.videoId} />;
      case "KICK":
        if (!mediaState.videoId) {
          return null;
        }
        return <KickWatchPlayer channel={mediaState.videoId} />;
      default:
        return null;
    }
  }

  const showSetupPanel = !mediaState || showMediaSetup;

  return (
    <Card glow className="flex max-w-full flex-col gap-4 overflow-hidden p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold">{t("rooms.watchParty")}</h2>
        <p className="mt-1 text-xs text-muted">{t("watch.subtitle")}</p>
      </div>

      {!isMember ? (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {t("watch.memberRequired")}
        </p>
      ) : null}

      {!isAuthenticated ? (
        <p className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-muted">
          {t("watch.loginRequired")}
        </p>
      ) : null}

      {loading ? (
        <p className="animate-pulse rounded-xl bg-surface px-3 py-6 text-center text-xs text-muted">
          {t("watch.loading")}
        </p>
      ) : null}

      {error ? (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </p>
      ) : null}

      {statusMessage ? (
        <p className="rounded-xl border border-accent/20 bg-accent/10 px-3 py-2 text-xs text-accent-foreground">
          {statusMessage}
        </p>
      ) : null}

      {!loading && isMember ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            {showSetupPanel ? (
              <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-5 space-y-4">
                <p className="text-center text-sm text-muted">
                  {mediaState ? "Yeni medya seç" : t("watch.noVideo")}
                </p>
                <WatchProviderSelector
                  selected={selectedProvider}
                  onSelect={setSelectedProvider}
                  disabled={!isMember || !isAuthenticated || actionLoading}
                />
                <WatchMediaForm
                  provider={selectedProvider}
                  disabled={!isMember || !isAuthenticated}
                  loading={actionLoading}
                  onSubmit={handleSetMedia}
                />
                {mediaState && showMediaSetup ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setShowMediaSetup(false)}
                  >
                    İptal
                  </Button>
                ) : null}
                {!mediaState && selectedProvider === "YOUTUBE" ? (
                  <>
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted">{t("watch.orStartNow")}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <AddToQueueForm
                      disabled={!isMember || !isAuthenticated}
                      loading={actionLoading}
                      onSubmit={handleAddToQueue}
                    />
                  </>
                ) : null}
              </div>
            ) : isAssistedExternalSyncMode(mediaState.mode) ? (
              <AssistedExternalSyncPanel
                mediaState={mediaState}
                readyUsers={readyUsers}
                currentUserId={currentUserId}
                isHost={isHost}
                actionLoading={actionLoading}
                syncNotice={syncNotice}
                onToggleReady={(isReady) => void handleToggleReady(isReady)}
                onStartCountdown={(seconds) => void handleStartCountdown(seconds)}
                onPauseCommand={() => void handlePause()}
                onPlayCommand={() => void handlePlay()}
                onSeekCommand={(seconds) => void handleSeek(seconds)}
              />
            ) : mediaState?.mode === "EXTERNAL_SYNC" ? (
              <ExternalSyncPlayer
                mediaState={mediaState}
                readyUsers={readyUsers}
                currentUserId={currentUserId}
                isHost={isHost}
                actionLoading={actionLoading}
                onToggleReady={(isReady) => void handleToggleReady(isReady)}
                onStartCountdown={(seconds) => void handleStartCountdown(seconds)}
                onTimerPlay={() => void handlePlay()}
                onTimerPause={() => void handlePause()}
                onTimerReset={() => void handleSeek(0)}
              />
            ) : (
              <div className="space-y-3">
                {mediaState ? (
                  <WatchModeBadge provider={mediaState.provider} mode={mediaState.mode} />
                ) : null}
                {renderEmbedPlayer()}
                {mediaState ? (
                  <div className="rounded-xl border border-border/60 bg-surface/40 px-3 py-2">
                    <p className="text-sm font-medium">{displayTitle}</p>
                    {mediaState.videoUrl ? (
                      <p className="mt-1 truncate text-xs text-muted">{mediaState.videoUrl}</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Card className="border border-accent/10 bg-accent/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">
                {t("watch.socialTitle")}
              </p>
              <p className="mt-2 text-sm">{socialStatus}</p>
              <p className="mt-2 text-xs text-muted">
                {t("watch.viewersCount", { count: members.length })}
              </p>
            </Card>

            {mediaState && !showMediaSetup ? (
              <>
                <WatchHostBadge host={mediaState.host} isCurrentUserHost={isHost} />

                {canChangeMedia ? (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setShowMediaSetup(true)}
                    disabled={actionLoading}
                  >
                    Medya değiştir
                  </Button>
                ) : null}

                {mediaState.mode === "EMBED" && mediaState.provider === "YOUTUBE" ? (
                  <>
                    <WatchControls
                      currentTime={currentTime}
                      isPlaying={isPlaying}
                      isHost={isHost}
                      disabled={actionLoading}
                      onPlay={handlePlay}
                      onPause={handlePause}
                      onSeek={handleSeek}
                      onSync={() => setSyncKey((value) => value + 1)}
                    />

                    {!isHost ? (
                      <Button
                        variant="secondary"
                        onClick={handleTakeHost}
                        disabled={actionLoading || !isMember}
                        className="w-full"
                      >
                        {t("watch.takeHost")}
                      </Button>
                    ) : null}

                    {isHost ? (
                      <AddToQueueForm
                        disabled={!isMember || !isAuthenticated}
                        loading={actionLoading}
                        onSubmit={handleAddToQueue}
                      />
                    ) : null}
                  </>
                ) : mediaState.mode === "EMBED" ? (
                  !isHost ? (
                    <Button
                      variant="secondary"
                      onClick={handleTakeHost}
                      disabled={actionLoading || !isMember}
                      className="w-full"
                    >
                      {t("watch.takeHost")}
                    </Button>
                  ) : null
                ) : null}
              </>
            ) : null}

            {mediaState?.provider === "YOUTUBE" ? (
              <WatchQueue
                queue={visibleQueue}
                mediaState={mediaState}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                actionLoading={actionLoading}
                onPlayItem={(itemId) => void handlePlayQueueItem(itemId)}
                onRemoveItem={(itemId) => void handleRemoveQueueItem(itemId)}
              />
            ) : null}

            <WatchViewerList members={members} />
          </div>
        </div>
      ) : null}
    </Card>
  );
}
