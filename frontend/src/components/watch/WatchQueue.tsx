"use client";

import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RoomMemberRole } from "@/types/room";
import type { RoomMediaState, WatchQueueItem } from "@/types/watch";
import { WatchQueueItemRow } from "./WatchQueueItem";

interface WatchQueueProps {
  queue: WatchQueueItem[];
  mediaState: RoomMediaState | null;
  currentUserId?: string | null;
  currentUserRole?: RoomMemberRole | null;
  actionLoading?: boolean;
  onPlayItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
}

export function WatchQueue({
  queue,
  mediaState,
  currentUserId,
  currentUserRole,
  actionLoading = false,
  onPlayItem,
  onRemoveItem,
}: WatchQueueProps) {
  const { t } = useLanguage();

  const canManagePlayback =
    Boolean(mediaState && currentUserId && mediaState.hostUserId === currentUserId) ||
    currentUserRole === "OWNER" ||
    currentUserRole === "MODERATOR";

  function canRemoveItem(item: WatchQueueItem) {
    if (!currentUserId) {
      return false;
    }

    return (
      item.addedById === currentUserId ||
      currentUserRole === "OWNER" ||
      currentUserRole === "MODERATOR" ||
      mediaState?.hostUserId === currentUserId
    );
  }

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold">{t("watch.queueTitle")}</h3>

      {queue.length === 0 ? (
        <p className="mt-3 text-xs text-muted">{t("watch.queueEmpty")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {queue.map((item) => (
            <WatchQueueItemRow
              key={item.id}
              item={item}
              canPlay={canManagePlayback}
              canRemove={canRemoveItem(item)}
              loading={actionLoading}
              onPlay={onPlayItem}
              onRemove={onRemoveItem}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}
