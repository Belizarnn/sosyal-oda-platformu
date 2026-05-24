"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FriendUser } from "@/types/friend";

interface MutualFriendsProps {
  count: number;
  friends: FriendUser[];
}

export function MutualFriends({ count, friends }: MutualFriendsProps) {
  const { t } = useLanguage();

  if (count === 0) {
    return (
      <p className="text-sm text-muted">{t("friends.mutualFriendsEmpty")}</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground/90">
        {t("friends.mutualFriendsCount", { count })}
      </p>

      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {friends.map((friend) => (
            <Link
              key={friend.id}
              href={`/profile/${friend.handle}`}
              className="rounded-full ring-2 ring-background transition hover:z-10"
              title={friend.username}
            >
              <Avatar name={friend.username} src={friend.avatarUrl} size="sm" />
            </Link>
          ))}
        </div>
        {count > friends.length ? (
          <span className="text-xs text-muted">
            {t("friends.mutualFriendsMore", { count: count - friends.length })}
          </span>
        ) : null}
      </div>
    </div>
  );
}
