"use client";

import Link from "next/link";
import type { ProfileActivity } from "@/types/user";
import type { RoomCategory } from "@/types/room";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabel } from "@/i18n/utils";

interface RecentActivityListProps {
  activity: ProfileActivity;
  username: string;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function RecentActivityList({
  activity,
  username,
}: RecentActivityListProps) {
  const { t } = useLanguage();

  return (
    <ul className="space-y-3">
      <li className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        {t("profile.joinedPlatform", {
          username,
          date: formatDate(activity.memberSince),
        })}
      </li>

      {activity.recentRooms.length === 0 ? (
        <li className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted">
          {t("profile.noRoomActivity")}
        </li>
      ) : (
        activity.recentRooms.map((room) => (
          <li key={room.id}>
            <Link
              href={`/rooms/${room.id}`}
              className="block rounded-xl border border-border bg-surface px-4 py-3 text-sm transition hover:border-accent/30"
            >
              <span className="text-muted">{t("profile.recentRoom")}</span>
              <span className="text-foreground/90">{room.name}</span>
              <span className="mt-1 block text-xs text-muted">
                {t("profile.roomCategory", {
                  category: getCategoryLabel(room.category as RoomCategory, t),
                })}
              </span>
            </Link>
          </li>
        ))
      )}
    </ul>
  );
}
