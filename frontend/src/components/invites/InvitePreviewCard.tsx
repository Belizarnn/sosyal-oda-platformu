"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabel, getRoomTypeLabel } from "@/i18n/utils";
import type { InvitePreview } from "@/types/invite";
import type { RoomCategory, RoomType } from "@/types/room";

interface InvitePreviewCardProps {
  preview: InvitePreview;
  inviteCode: string;
  isLoggedIn: boolean;
  isMember: boolean;
  loading: boolean;
  error: string | null;
  password: string;
  onPasswordChange: (value: string) => void;
  onJoin: () => void;
}

export function InvitePreviewCard({
  preview,
  inviteCode,
  isLoggedIn,
  isMember,
  loading,
  error,
  password,
  onPasswordChange,
  onJoin,
}: InvitePreviewCardProps) {
  const { t } = useLanguage();
  const { room, owner, requiresPassword } = preview;
  const isFull = room.currentUserCount >= room.maxUserCount;

  return (
    <Card glow className="mx-auto w-full max-w-lg space-y-6">
      <div className="space-y-3 text-center">
        <Badge variant="accent">{getCategoryLabel(room.category as RoomCategory, t)}</Badge>
        <h1 className="text-2xl font-semibold">{room.name}</h1>
        <p className="text-sm text-muted">
          {room.description ?? t("rooms.noDescription")}
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface p-4">
        <Avatar name={owner.username} src={owner.avatarUrl} size="md" />
        <div className="text-left">
          <p className="text-sm font-medium">{owner.username}</p>
          <p className="text-xs text-muted">@{owner.handle}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-muted">{t("rooms.roomTypeLabel")}</p>
          <p className="mt-1 font-medium">{getRoomTypeLabel(room.type as RoomType, t)}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-3">
          <p className="text-muted">{t("rooms.memberCountLabel")}</p>
          <p className="mt-1 font-medium">
            {room.currentUserCount}/{room.maxUserCount}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {isFull && !isMember ? (
        <p className="text-center text-sm text-amber-200">{t("rooms.full")}</p>
      ) : null}

      {!isLoggedIn ? (
        <div className="space-y-3 text-center">
          <p className="text-sm text-muted">{t("rooms.loginToJoin")}</p>
          <Button href={`/login?redirect=/invite/${inviteCode}`}>{t("nav.login")}</Button>
        </div>
      ) : isMember ? (
        <Button href={`/rooms/${room.id}`} className="w-full">
          {t("dashboard.goToRoom")}
        </Button>
      ) : (
        <div className="space-y-4">
          {requiresPassword ? (
            <Input
              label={t("rooms.passwordLabel")}
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder={t("rooms.passwordJoinPlaceholder")}
            />
          ) : null}

          <Button
            className="w-full"
            onClick={onJoin}
            disabled={loading || isFull}
          >
            {loading ? t("rooms.joining") : t("rooms.join")}
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-muted">
        <Link href="/discover" className="hover:text-foreground">
          {t("rooms.backToDiscover")}
        </Link>
      </p>
    </Card>
  );
}
