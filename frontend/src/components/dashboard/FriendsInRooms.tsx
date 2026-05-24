"use client";

import { FriendActivityCard } from "@/components/friends/FriendActivityCard";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FriendActivityItem } from "@/types/friend";

interface FriendsInRoomsProps {
  friends: FriendActivityItem[];
  onMessage?: (userId: string) => void;
}

export function FriendsInRooms({ friends, onMessage }: FriendsInRoomsProps) {
  const { t } = useLanguage();
  const friendsInRooms = friends.filter((friend) => friend.currentRoom);

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{t("dashboard.friendsInRooms.title")}</h2>
      {friendsInRooms.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-muted">{t("dashboard.friendsInRooms.empty")}</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {friendsInRooms.map((friend) => (
            <FriendActivityCard
              key={friend.id}
              friend={friend}
              onMessage={onMessage ?? (() => undefined)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
