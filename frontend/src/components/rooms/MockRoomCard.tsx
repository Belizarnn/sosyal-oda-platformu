import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { Room } from "@/data/types";

interface MockRoomCardProps {
  room: Room;
}

export function MockRoomCard({ room }: MockRoomCardProps) {
  return (
    <Link href={`/rooms/${room.id}`}>
      <Card className="group h-full transition hover:border-accent/30 hover:bg-surface-hover">
        <div className="mb-3 flex items-start justify-between gap-2">
          <Badge variant="accent">{room.category}</Badge>
          {room.isActive ? (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Aktif
            </span>
          ) : null}
        </div>
        <h3 className="mb-2 text-base font-semibold group-hover:text-accent">
          {room.name}
        </h3>
        <p className="mb-4 line-clamp-2 text-sm text-muted">{room.description}</p>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>@{room.hostHandle}</span>
          <span>
            {room.memberCount}/{room.maxMembers} üye
          </span>
        </div>
      </Card>
    </Link>
  );
}
