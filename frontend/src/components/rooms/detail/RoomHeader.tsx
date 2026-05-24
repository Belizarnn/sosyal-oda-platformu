"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getCategoryLabel,
  getRoomTypeLabel,
} from "@/i18n/utils";
import type { InviteSettings } from "@/types/invite";
import type { RoomDetailResponse } from "@/types/room";
import { RoomActions } from "./RoomActions";

interface RoomHeaderProps {
  data: RoomDetailResponse;
  inviteSettings: InviteSettings | null;
  requiresInviteForJoin: boolean;
  actionLoading: boolean;
  actionError: string | null;
  onJoin: () => void;
  onLeave: () => void;
}

export function RoomHeader({
  data,
  inviteSettings,
  requiresInviteForJoin,
  actionLoading,
  actionError,
  onJoin,
  onLeave,
}: RoomHeaderProps) {
  const { t } = useLanguage();
  const { success } = useToast();
  const { room, owner, isMember, currentUserRole } = data;

  async function handleCopyInvite() {
    if (!inviteSettings?.inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteSettings.inviteUrl);
      success(t("invite.copySuccess"));
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <Card glow className="p-5 sm:p-6">
      {/* TODO (Sprint 29+): Premium oda temaları burada uygulanacak (roomThemes feature). */}
      <div className="mb-4 flex items-center gap-2 text-sm text-muted">
        <Link href="/rooms" className="hover:text-foreground">
          {t("rooms.title")}
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{room.name}</span>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{getCategoryLabel(room.category, t)}</Badge>
            <Badge variant="muted">{getRoomTypeLabel(room.type, t)}</Badge>
            <Badge variant="muted">
              {t("rooms.memberCount", {
                current: room.currentUserCount,
                max: room.maxUserCount,
              })}
            </Badge>
          </div>

          <h1 className="text-2xl font-semibold sm:text-3xl">{room.name}</h1>

          {room.description ? (
            <p className="line-clamp-2 text-sm leading-relaxed text-muted">{room.description}</p>
          ) : null}

          <div className="flex items-center gap-3">
            <Avatar name={owner.username} src={owner.avatarUrl} size="sm" />
            <div>
              <p className="text-sm font-medium">{owner.username}</p>
              <p className="text-xs text-muted">@{owner.handle}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {inviteSettings?.inviteEnabled && data.canManageInvite ? (
            <Button variant="secondary" size="sm" onClick={() => void handleCopyInvite()}>
              {t("rooms.inviteCopy")}
            </Button>
          ) : null}

          <RoomActions
            isMember={isMember}
            requiresInviteForJoin={requiresInviteForJoin}
            currentUserRole={currentUserRole}
            actionLoading={actionLoading}
            actionError={actionError}
            onJoin={onJoin}
            onLeave={onLeave}
          />
        </div>
      </div>
    </Card>
  );
}
