"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PresenceDot } from "@/components/presence/PresenceDot";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabel } from "@/i18n/utils";
import { ApiError, joinRoom } from "@/lib/api";
import { getPresenceLabel, getPresenceMeta } from "@/lib/presence";
import type { FriendActivityItem } from "@/types/friend";

interface FriendActivityCardProps {
  friend: FriendActivityItem;
  actionLoading?: boolean;
  onMessage: (userId: string) => void;
  onRemove?: (userId: string) => void;
  showRemove?: boolean;
}

export function FriendActivityCard({
  friend,
  actionLoading = false,
  onMessage,
  onRemove,
  showRemove = false,
}: FriendActivityCardProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [joining, setJoining] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const presenceMeta = getPresenceMeta(friend.presenceStatus);
  const canQuickJoin =
    friend.currentRoom?.type === "PUBLIC" && !friend.isRoomMember;

  async function handleJoinRoom() {
    if (!friend.currentRoom) {
      return;
    }

    if (friend.isRoomMember) {
      router.push(`/rooms/${friend.currentRoom.id}`);
      return;
    }

    if (friend.currentRoom.type !== "PUBLIC") {
      router.push(`/rooms/${friend.currentRoom.id}`);
      return;
    }

    setJoining(true);
    setAccessError(null);

    try {
      await joinRoom(friend.currentRoom.id);
      router.push(`/rooms/${friend.currentRoom.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setAccessError(err.message || t("friends.roomAccessDenied"));
      } else {
        setAccessError(t("friends.roomAccessDenied"));
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <Card glow className="flex flex-col gap-4 p-4">
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <Avatar name={friend.username} src={friend.avatarUrl} size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-ring-offset">
            <PresenceDot status={friend.presenceStatus} className="h-2.5 w-2.5" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{friend.username}</p>
          <p className="truncate text-sm text-muted">@{friend.handle}</p>
          <p className={`mt-1 text-xs ${presenceMeta.textClass}`}>
            {getPresenceLabel(friend.presenceStatus, t)}
          </p>
          {friend.statusMessage ? (
            <p className="mt-1 truncate text-xs text-foreground/80">{friend.statusMessage}</p>
          ) : null}
          {friend.currentRoom ? (
            <p className="mt-2 truncate text-xs text-muted">
              {t("friends.inRoom", { roomName: friend.currentRoom.name })} ·{" "}
              {getCategoryLabel(friend.currentRoom.category, t)}
            </p>
          ) : null}
        </div>
      </div>

      {accessError ? (
        <p className="text-xs text-red-300">{accessError}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" href={`/profile/${friend.handle}`} size="sm">
          {t("friends.viewProfile")}
        </Button>
        <Button
          size="sm"
          onClick={() => onMessage(friend.id)}
          disabled={actionLoading}
        >
          {actionLoading ? t("chat.sending") : t("friends.sendMessage")}
        </Button>
        {friend.currentRoom ? (
          <Button
            size="sm"
            variant={friend.isRoomMember ? "secondary" : "primary"}
            disabled={joining || actionLoading}
            onClick={() => void handleJoinRoom()}
          >
            {joining
              ? t("rooms.joining")
              : friend.isRoomMember
                ? t("rooms.enterRoom")
                : canQuickJoin
                  ? t("friends.joinRoom")
                  : t("rooms.enterRoom")}
          </Button>
        ) : null}
        {showRemove && onRemove ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(friend.id)}
            disabled={actionLoading}
          >
            {t("friends.removeFriend")}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
