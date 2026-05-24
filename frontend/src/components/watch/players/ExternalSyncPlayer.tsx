"use client";

import { Button } from "@/components/ui/Button";
import { WatchCountdown } from "@/components/watch/WatchCountdown";
import { WatchModeBadge } from "@/components/watch/WatchModeBadge";
import { WatchReadyList } from "@/components/watch/WatchReadyList";
import { WatchTimer } from "@/components/watch/WatchTimer";
import type { RoomMediaState, WatchReadyUser } from "@/types/watch";
import { getProviderLabel } from "@/types/watch";

interface ExternalSyncPlayerProps {
  mediaState: RoomMediaState;
  readyUsers: WatchReadyUser[];
  currentUserId?: string | null;
  isHost: boolean;
  actionLoading?: boolean;
  onToggleReady: (isReady: boolean) => void;
  onStartCountdown: (seconds: 3 | 5 | 10) => void;
  onTimerPlay: () => void;
  onTimerPause: () => void;
  onTimerReset: () => void;
  onCountdownComplete?: () => void;
}

export function ExternalSyncPlayer({
  mediaState,
  readyUsers,
  currentUserId,
  isHost,
  actionLoading,
  onToggleReady,
  onStartCountdown,
  onTimerPlay,
  onTimerPause,
  onTimerReset,
  onCountdownComplete,
}: ExternalSyncPlayerProps) {
  const currentUserReady =
    readyUsers.find((user) => user.id === currentUserId)?.isReady ?? false;

  return (
    <div className="space-y-4">
      <WatchModeBadge provider={mediaState.provider} mode={mediaState.mode} />

      <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
        <p className="text-xs uppercase tracking-wide text-muted">
          {getProviderLabel(mediaState.provider)}
        </p>
        <h3 className="mt-1 text-lg font-semibold">
          {mediaState.externalTitle ?? mediaState.title ?? "Seçilen içerik"}
        </h3>

        {mediaState.externalUrl ? (
          <a
            href={mediaState.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex"
          >
            <Button variant="secondary" size="sm">
              Platformda Aç
            </Button>
          </a>
        ) : null}
      </div>

      <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        Bu servis telif ve abonelik kısıtları nedeniyle platform içinde oynatılamaz. Her
        kullanıcı içeriği kendi hesabında açar; Sosyal Oda hazır olma, geri sayım, timer,
        chat ve voice desteği sağlar.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentUserReady ? "secondary" : "primary"}
          disabled={actionLoading}
          onClick={() => onToggleReady(!currentUserReady)}
        >
          {currentUserReady ? "Hazır değilim" : "Hazırım"}
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Hazır kullanıcılar
        </p>
        <WatchReadyList readyUsers={readyUsers} currentUserId={currentUserId} />
      </div>

      {isHost ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Geri sayım
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={actionLoading}
              onClick={() => onStartCountdown(3)}
            >
              3 sn başlat
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={actionLoading}
              onClick={() => onStartCountdown(5)}
            >
              5 sn başlat
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={actionLoading}
              onClick={() => onStartCountdown(10)}
            >
              10 sn başlat
            </Button>
          </div>
        </div>
      ) : null}

      <WatchCountdown
        countdownEndsAt={mediaState.countdownEndsAt}
        onComplete={onCountdownComplete}
      />

      <WatchTimer
        currentTime={mediaState.currentTime}
        isPlaying={mediaState.isPlaying}
        isHost={isHost}
        disabled={actionLoading}
        onPlay={onTimerPlay}
        onPause={onTimerPause}
        onReset={onTimerReset}
      />
    </div>
  );
}
