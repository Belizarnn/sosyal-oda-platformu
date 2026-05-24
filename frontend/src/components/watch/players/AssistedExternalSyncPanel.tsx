"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { WatchCountdown } from "@/components/watch/WatchCountdown";
import { WatchModeBadge } from "@/components/watch/WatchModeBadge";
import { WatchReadyList } from "@/components/watch/WatchReadyList";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  formatSeasonEpisode,
  formatStartOffsetMinutes,
  getAssistedOpenUrl,
} from "@/lib/assistedExternalSync";
import type { RoomMediaState, WatchReadyUser } from "@/types/watch";
import { getProviderLabel } from "@/types/watch";

interface AssistedExternalSyncPanelProps {
  mediaState: RoomMediaState;
  readyUsers: WatchReadyUser[];
  currentUserId?: string | null;
  isHost: boolean;
  actionLoading?: boolean;
  syncNotice?: string | null;
  onToggleReady: (isReady: boolean) => void;
  onStartCountdown: (seconds: 3 | 5 | 10) => void;
  onPauseCommand: () => void;
  onPlayCommand: () => void;
  onSeekCommand: (seconds: number) => void;
  onCountdownComplete?: () => void;
}

export function AssistedExternalSyncPanel({
  mediaState,
  readyUsers,
  currentUserId,
  isHost,
  actionLoading,
  syncNotice,
  onToggleReady,
  onStartCountdown,
  onPauseCommand,
  onPlayCommand,
  onSeekCommand,
  onCountdownComplete,
}: AssistedExternalSyncPanelProps) {
  const { t } = useLanguage();
  const [seekMinutes, setSeekMinutes] = useState("");

  const currentUserReady =
    readyUsers.find((user) => user.id === currentUserId)?.isReady ?? false;
  const readyCount = readyUsers.filter((user) => user.isReady).length;
  const openUrl = getAssistedOpenUrl(mediaState);
  const seasonEpisode = formatSeasonEpisode(
    mediaState.externalSeason,
    mediaState.externalEpisode,
  );
  const startOffsetMinutes = formatStartOffsetMinutes(
    mediaState.externalStartOffsetMinutes,
  );

  function handleSeekSubmit() {
    const parsed = Number(seekMinutes);
    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }
    onSeekCommand(Math.floor(parsed * 60));
  }

  return (
    <div className="space-y-4">
      <WatchModeBadge provider={mediaState.provider} mode={mediaState.mode} />

      <div className="rounded-xl border border-border bg-surface/60 p-4">
        <p className="text-xs uppercase tracking-wide text-muted">
          {getProviderLabel(mediaState.provider)}
        </p>
        <h3 className="mt-1 text-lg font-semibold">
          {mediaState.externalTitle ?? mediaState.title ?? t("watch.assisted.untitled")}
        </h3>

        {seasonEpisode ? (
          <p className="mt-1 text-sm text-muted">{seasonEpisode}</p>
        ) : null}

        {startOffsetMinutes != null ? (
          <p className="mt-1 text-xs text-muted">
            {t("watch.assisted.startOffsetMinutes", { minutes: startOffsetMinutes })}
          </p>
        ) : null}

        {mediaState.externalNotes ? (
          <p className="mt-2 text-xs text-muted">{mediaState.externalNotes}</p>
        ) : null}

        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex"
        >
          <Button variant="primary" size="sm">
            {t("watch.assisted.openOnPlatform", {
              platform: getProviderLabel(mediaState.provider),
            })}
          </Button>
        </a>
      </div>

      <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        {t("watch.assisted.info", {
          platform: getProviderLabel(mediaState.provider),
        })}
      </p>

      {syncNotice ? (
        <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent-foreground">
          {syncNotice}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentUserReady ? "secondary" : "primary"}
          disabled={actionLoading}
          onClick={() => onToggleReady(!currentUserReady)}
        >
          {currentUserReady
            ? t("watch.assisted.notReady")
            : t("watch.assisted.ready")}
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          {t("watch.assisted.readyUsers", {
            ready: readyCount,
            total: readyUsers.length,
          })}
        </p>
        <WatchReadyList readyUsers={readyUsers} currentUserId={currentUserId} />
      </div>

      {isHost ? (
        <div className="space-y-3 rounded-xl border border-border/60 bg-surface/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {t("watch.assisted.hostControls")}
          </p>

          <div>
            <p className="mb-2 text-xs text-muted">{t("watch.assisted.countdown")}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={actionLoading}
                onClick={() => onStartCountdown(3)}
              >
                {t("watch.assisted.countdownSeconds", { seconds: 3 })}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={actionLoading}
                onClick={() => onStartCountdown(5)}
              >
                {t("watch.assisted.countdownSeconds", { seconds: 5 })}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={actionLoading}
                onClick={() => onStartCountdown(10)}
              >
                {t("watch.assisted.countdownSeconds", { seconds: 10 })}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={actionLoading}
              onClick={onPauseCommand}
            >
              {t("watch.assisted.sendPause")}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={actionLoading}
              onClick={onPlayCommand}
            >
              {t("watch.assisted.sendPlay")}
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label className="block text-xs text-muted">
              {t("watch.assisted.seekMinutesLabel")}
              <input
                type="number"
                min={0}
                step={1}
                value={seekMinutes}
                onChange={(event) => setSeekMinutes(event.target.value)}
                placeholder="0"
                disabled={actionLoading}
                className="mt-1 w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              />
            </label>
            <Button
              variant="secondary"
              size="sm"
              disabled={actionLoading || seekMinutes.trim() === ""}
              onClick={handleSeekSubmit}
            >
              {t("watch.assisted.sendSeek")}
            </Button>
          </div>
        </div>
      ) : null}

      <WatchCountdown
        countdownEndsAt={mediaState.countdownEndsAt}
        onComplete={onCountdownComplete}
      />
    </div>
  );
}
