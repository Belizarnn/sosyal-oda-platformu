"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Room } from "@/data/types";

interface ActiveRoomCardProps {
  room: Room;
}

export function ActiveRoomCard({ room }: ActiveRoomCardProps) {
  const { t } = useLanguage();

  return (
    <Link href={`/rooms/${room.id}`}>
      <Card className="transition hover:border-accent/30 hover:bg-surface-hover">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant="accent">{room.category}</Badge>
          <span className="text-xs text-muted">
            {room.memberCount} {t("common.people")}
          </span>
        </div>
        <h3 className="mb-1 font-medium">{room.name}</h3>
        <p className="line-clamp-1 text-sm text-muted">@{room.hostHandle}</p>
      </Card>
    </Link>
  );
}
