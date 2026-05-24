"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabel, getRoomTypeLabel } from "@/i18n/utils";
import { ApiError, joinRoom } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type { RoomListItem } from "@/types/room";
import { cn } from "@/lib/cn";
import { RoomJoinPasswordModal } from "./RoomJoinPasswordModal";

interface RoomCardProps {
  room: RoomListItem;
  isMember?: boolean;
  className?: string;
}

export function RoomCard({ room, isMember = false, className }: RoomCardProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [joining, setJoining] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  async function performJoin(password?: string) {
    setJoining(true);
    setJoinError(null);
    trackEvent("room_join_clicked", {
      roomId: room.id,
      category: room.category,
      type: room.type,
    });

    try {
      await joinRoom(room.id, password ? { password } : {});
      router.push(`/rooms/${room.id}`);
    } catch (err) {
      setJoinError(err instanceof ApiError ? err.message : t("rooms.joinFailed"));
    } finally {
      setJoining(false);
    }
  }

  function handlePrimaryAction() {
    if (isMember) {
      router.push(`/rooms/${room.id}`);
      return;
    }

    if (room.type === "PASSWORD_PROTECTED") {
      setJoinError(null);
      setPasswordOpen(true);
      return;
    }

    void performJoin();
  }

  function handlePasswordSubmit(password: string) {
    void performJoin(password).then(() => {
      if (!joinError) {
        setPasswordOpen(false);
      }
    });
  }

  return (
    <>
      <Card
        className={cn(
          "group flex h-full flex-col transition hover:border-accent/30 hover:bg-surface-hover",
          className,
        )}
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <Badge variant="accent">{getCategoryLabel(room.category, t)}</Badge>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="muted">{getRoomTypeLabel(room.type, t)}</Badge>
            {room.isActive ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
                {t("rooms.active")}
              </span>
            ) : null}
          </div>
        </div>

        <h3 className="mb-2 text-base font-semibold group-hover:text-accent">{room.name}</h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted">
          {room.description ?? t("rooms.noDescription")}
        </p>

        <div className="mb-4 flex items-center gap-3">
          <Avatar name={room.owner.username} src={room.owner.avatarUrl} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm">{room.owner.username}</p>
            <p className="truncate text-xs text-muted">@{room.owner.handle}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted">
          <span>
            {t("rooms.memberCount", {
              current: room.currentUserCount,
              max: room.maxUserCount,
            })}
          </span>
          <Button
            size="sm"
            variant={isMember ? "secondary" : "primary"}
            className="px-3 py-1.5 text-xs"
            disabled={joining}
            onClick={handlePrimaryAction}
          >
            {joining
              ? t("rooms.joining")
              : isMember
                ? t("rooms.enterRoom")
                : t("rooms.join")}
          </Button>
        </div>
      </Card>

      <RoomJoinPasswordModal
        open={passwordOpen}
        roomName={room.name}
        loading={joining}
        error={joinError}
        onClose={() => {
          setPasswordOpen(false);
          setJoinError(null);
        }}
        onSubmit={(password) => {
          void (async () => {
            setJoining(true);
            setJoinError(null);
            try {
              await joinRoom(room.id, { password });
              setPasswordOpen(false);
              router.push(`/rooms/${room.id}`);
            } catch (err) {
              setJoinError(err instanceof ApiError ? err.message : t("rooms.joinFailed"));
            } finally {
              setJoining(false);
            }
          })();
        }}
      />
    </>
  );
}
