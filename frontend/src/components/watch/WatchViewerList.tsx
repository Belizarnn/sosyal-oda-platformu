"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPresenceLabel } from "@/lib/presence";
import type { RoomMember } from "@/types/room";

interface WatchViewerListProps {
  members: RoomMember[];
}

export function WatchViewerList({ members }: WatchViewerListProps) {
  const { t } = useLanguage();

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold">{t("watch.viewersTitle")}</h3>
      <p className="mt-1 text-xs text-muted">{t("watch.viewersHint")}</p>

      <ul className="mt-3 space-y-2">
        {members.map((member) => (
          <li key={member.id} className="flex items-center gap-3 rounded-xl bg-surface/40 px-3 py-2">
            <Avatar name={member.user.username} src={member.user.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.user.username}</p>
              <p className="truncate text-xs text-muted">
                {getPresenceLabel(member.user.presenceStatus, t)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
