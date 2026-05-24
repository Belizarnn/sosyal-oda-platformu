"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MemberModerationMenu } from "@/components/moderation/MemberModerationMenu";
import { useLanguage } from "@/contexts/LanguageContext";
import { getRoomRoleLabel } from "@/i18n/utils";
import { getPresenceLabel } from "@/lib/presence";
import type { RoomMember } from "@/types/room";

interface RoomMembersPanelProps {
  roomId: string;
  members: RoomMember[];
  currentUserMember: RoomMember | null;
  currentUserId?: string | null;
  onUpdated: () => void;
}

export function RoomMembersPanel({
  roomId,
  members,
  currentUserMember,
  currentUserId,
  onUpdated,
}: RoomMembersPanelProps) {
  const { t } = useLanguage();

  return (
    <Card className="flex h-full min-h-[320px] flex-col overflow-hidden p-4 sm:p-5">
      <h2 className="mb-4 text-base font-semibold">{t("rooms.membersTitle")}</h2>
      <ul className="space-y-3 overflow-y-auto">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-start gap-3 rounded-xl border border-border/60 bg-surface/40 p-3"
          >
            <Avatar name={member.user.username} src={member.user.avatarUrl} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium">{member.user.username}</p>
                {member.role !== "MEMBER" ? (
                  <Badge variant="accent">{getRoomRoleLabel(member.role, t)}</Badge>
                ) : null}
                {member.isMuted ? (
                  <Badge variant="muted">{t("rooms.members.muted")}</Badge>
                ) : null}
                {member.isBanned ? (
                  <Badge variant="muted">{t("rooms.members.banned")}</Badge>
                ) : null}
              </div>
              <p className="truncate text-xs text-muted">@{member.user.handle}</p>
              <p className="mt-1 text-xs text-muted">
                {getPresenceLabel(member.user.presenceStatus, t)}
              </p>
            </div>
            <MemberModerationMenu
              roomId={roomId}
              targetMember={member}
              currentUserMember={currentUserMember}
              currentUserId={currentUserId}
              onUpdated={onUpdated}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}
