"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { WatchQueueItem } from "@/types/watch";

interface WatchQueueItemProps {
  item: WatchQueueItem;
  canPlay: boolean;
  canRemove: boolean;
  loading?: boolean;
  onPlay: (itemId: string) => void;
  onRemove: (itemId: string) => void;
}

export function WatchQueueItemRow({
  item,
  canPlay,
  canRemove,
  loading = false,
  onPlay,
  onRemove,
}: WatchQueueItemProps) {
  const { t } = useLanguage();
  const isPlaying = item.status === "PLAYING";

  return (
    <li className="rounded-xl border border-border/60 bg-surface/40 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-black/40 text-xs text-muted">
          ▶
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">
              {item.title ?? item.videoId}
            </p>
            {isPlaying ? (
              <Badge variant="accent">{t("watch.queuePlaying")}</Badge>
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs text-muted">
            @{item.addedBy.handle}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {canPlay && !isPlaying ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={loading}
            onClick={() => onPlay(item.id)}
          >
            {t("watch.playFromQueue")}
          </Button>
        ) : null}

        {canRemove ? (
          <Button
            size="sm"
            variant="ghost"
            disabled={loading}
            onClick={() => onRemove(item.id)}
          >
            {t("watch.removeFromQueue")}
          </Button>
        ) : null}
      </div>
    </li>
  );
}
