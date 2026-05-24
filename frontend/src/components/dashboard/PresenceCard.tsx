"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/presence/PresenceDot";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPresenceLabel, getPresenceMeta } from "@/lib/presence";
import type { Friend } from "@/types/friend";

interface PresenceCardProps {
  friend: Friend;
}

export function PresenceCard({ friend }: PresenceCardProps) {
  const { t } = useLanguage();
  const meta = getPresenceMeta(friend.presenceStatus);
  const presenceLabel = getPresenceLabel(friend.presenceStatus, t);

  return (
    <Link href={`/profile/${friend.handle}`}>
      <Card className="flex items-center gap-3 p-4 transition hover:border-border">
        <div className="relative">
          <Avatar name={friend.username} src={friend.avatarUrl} size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-ring-offset">
            <PresenceDot status={friend.presenceStatus} className="h-2.5 w-2.5" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{friend.username}</p>
          <p className="truncate text-xs text-muted">@{friend.handle}</p>
          {friend.statusMessage ? (
            <p className="mt-1 truncate text-xs text-foreground/80">
              {friend.statusMessage}
            </p>
          ) : null}
        </div>
        <span className={`shrink-0 text-xs ${meta.textClass}`}>{presenceLabel}</span>
      </Card>
    </Link>
  );
}
