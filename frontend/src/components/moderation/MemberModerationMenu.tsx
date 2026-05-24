"use client";

import { useMemo, useState } from "react";
import { ConfirmActionModal } from "@/components/moderation/ConfirmActionModal";
import { ReportModal } from "@/components/moderation/ReportModal";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  banRoomMember,
  kickRoomMember,
  muteRoomMember,
  unbanRoomMember,
  unmuteRoomMember,
} from "@/lib/api";
import {
  canBan,
  canKick,
  canMute,
} from "@/lib/permissions";
import type { ModerationAction } from "@/types/moderation";
import type { RoomMember } from "@/types/room";

interface MemberModerationMenuProps {
  roomId: string;
  targetMember: RoomMember;
  currentUserMember: RoomMember | null;
  currentUserId?: string | null;
  onUpdated: () => void;
}

export function MemberModerationMenu({
  roomId,
  targetMember,
  currentUserMember,
  currentUserId,
  onUpdated,
}: MemberModerationMenuProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ModerationAction | null>(
    null,
  );
  const [reportOpen, setReportOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isSelf = targetMember.userId === currentUserId;
  const showKick = canKick(currentUserMember, targetMember, currentUserId);
  const showMute =
    canMute(currentUserMember, targetMember, currentUserId) &&
    !targetMember.isMuted;
  const showUnmute =
    canMute(currentUserMember, targetMember, currentUserId) &&
    targetMember.isMuted;
  const showBan = canBan(currentUserMember, targetMember, currentUserId);
  const showUnban =
    currentUserMember?.role === "OWNER" && targetMember.isBanned;
  const hasActions =
    showKick || showMute || showUnmute || showBan || showUnban || !isSelf;

  const confirmCopy = useMemo(
    (): Record<
      ModerationAction,
      { title: string; description: string; label: string; danger?: boolean }
    > => ({
      kick: {
        title: t("moderation.kick.title"),
        description: t("moderation.kick.description"),
        label: t("moderation.kick"),
        danger: true,
      },
      mute: {
        title: t("moderation.mute.title"),
        description: t("moderation.mute.description"),
        label: t("moderation.mute"),
      },
      unmute: {
        title: t("moderation.unmute.title"),
        description: t("moderation.unmute.description"),
        label: t("moderation.unmute"),
      },
      ban: {
        title: t("moderation.ban.title"),
        description: t("moderation.ban.description"),
        label: t("moderation.ban"),
        danger: true,
      },
      unban: {
        title: t("moderation.unban.title"),
        description: t("moderation.unban.description"),
        label: t("moderation.unban"),
      },
    }),
    [t],
  );

  if (!hasActions) {
    return null;
  }

  async function runAction(action: ModerationAction) {
    setLoading(true);
    setFeedback(null);

    try {
      switch (action) {
        case "kick":
          await kickRoomMember(roomId, targetMember.userId);
          setFeedback(t("moderation.kick.success"));
          break;
        case "mute":
          await muteRoomMember(roomId, targetMember.userId);
          setFeedback(t("moderation.mute.success"));
          break;
        case "unmute":
          await unmuteRoomMember(roomId, targetMember.userId);
          setFeedback(t("moderation.unmute.success"));
          break;
        case "ban":
          await banRoomMember(roomId, targetMember.userId);
          setFeedback(t("moderation.ban.success"));
          break;
        case "unban":
          await unbanRoomMember(roomId, targetMember.userId);
          setFeedback(t("moderation.unban.success"));
          break;
      }

      setConfirmAction(null);
      setOpen(false);
      onUpdated();
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : t("moderation.actionFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-muted transition hover:text-foreground"
        aria-label={t("moderation.menuAria")}
      >
        ⋮
      </button>

      {targetMember.isMuted ? (
        <Badge variant="muted" className="ml-2">
          {t("moderation.mutedBadge")}
        </Badge>
      ) : null}

      {open ? (
        <div className="absolute right-0 top-8 z-20 min-w-[180px] rounded-xl border border-border bg-dropdown p-2 shadow-lg">
          {showKick ? (
            <MenuButton label={t("moderation.kick")} onClick={() => setConfirmAction("kick")} danger />
          ) : null}

          {showMute ? (
            <MenuButton label={t("moderation.mute")} onClick={() => setConfirmAction("mute")} />
          ) : null}

          {showUnmute ? (
            <MenuButton label={t("moderation.unmute")} onClick={() => setConfirmAction("unmute")} />
          ) : null}

          {showBan ? (
            <MenuButton label={t("moderation.ban")} onClick={() => setConfirmAction("ban")} danger />
          ) : null}

          {showUnban ? (
            <MenuButton label={t("moderation.unban")} onClick={() => setConfirmAction("unban")} />
          ) : null}

          {!isSelf ? (
            <MenuButton
              label={t("moderation.reportUser")}
              onClick={() => {
                setOpen(false);
                setReportOpen(true);
              }}
            />
          ) : null}
        </div>
      ) : null}

      {feedback ? (
        <p className="mt-1 text-[11px] text-muted">{feedback}</p>
      ) : null}

      {confirmAction ? (
        <ConfirmActionModal
          open
          title={confirmCopy[confirmAction].title}
          description={confirmCopy[confirmAction].description}
          confirmLabel={confirmCopy[confirmAction].label}
          danger={confirmCopy[confirmAction].danger}
          loading={loading}
          onConfirm={() => void runAction(confirmAction)}
          onClose={() => setConfirmAction(null)}
        />
      ) : null}

      <ReportModal
        open={reportOpen}
        targetType="USER"
        targetUserId={targetMember.userId}
        targetRoomId={roomId}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}

function MenuButton({
  label,
  onClick,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-surface ${
        danger ? "text-red-300" : "text-foreground/90"
      }`}
    >
      {label}
    </button>
  );
}
