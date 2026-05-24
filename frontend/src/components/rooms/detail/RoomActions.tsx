"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RoomMemberRole } from "@/types/room";

interface RoomActionsProps {
  isMember: boolean;
  requiresInviteForJoin: boolean;
  currentUserRole: RoomMemberRole | null;
  actionLoading: boolean;
  actionError: string | null;
  onJoin: () => void;
  onLeave: () => void;
}

export function RoomActions({
  isMember,
  requiresInviteForJoin,
  currentUserRole,
  actionLoading,
  actionError,
  onJoin,
  onLeave,
}: RoomActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actionError ? <span className="text-sm text-red-300">{actionError}</span> : null}

      {isMember ? (
        <Button
          variant="secondary"
          onClick={onLeave}
          disabled={actionLoading || currentUserRole === "OWNER"}
        >
          {actionLoading ? t("rooms.processing") : t("rooms.leave")}
        </Button>
      ) : requiresInviteForJoin ? (
        <span className="text-sm text-amber-200">{t("rooms.inviteRequired")}</span>
      ) : (
        <Button onClick={onJoin} disabled={actionLoading}>
          {actionLoading ? t("rooms.joining") : t("rooms.join")}
        </Button>
      )}
    </div>
  );
}
