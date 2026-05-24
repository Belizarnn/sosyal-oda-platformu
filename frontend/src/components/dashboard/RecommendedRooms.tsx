"use client";

import { RoomCard } from "@/components/rooms/RoomCard";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RoomListItem } from "@/types/room";

interface RecommendedRoomsProps {
  rooms: RoomListItem[];
  variant?: "recommended" | "active";
}

export function RecommendedRooms({ rooms, variant = "recommended" }: RecommendedRoomsProps) {
  const { t } = useLanguage();
  const titleKey =
    variant === "active" ? "dashboard.activeRooms" : "dashboard.recommended.title";

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{t(titleKey)}</h2>
      {rooms.length === 0 ? (
        <Card className="p-5">
          <p className="text-sm text-muted">{t("dashboard.recommended.empty")}</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} isMember={room.isMember} />
          ))}
        </div>
      )}
    </section>
  );
}
