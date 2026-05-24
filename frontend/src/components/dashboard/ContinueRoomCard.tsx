"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabel } from "@/i18n/utils";
import type { DashboardContinueRoom } from "@/types/dashboard";

interface ContinueRoomCardProps {
  room: DashboardContinueRoom | null;
}

export function ContinueRoomCard({ room }: ContinueRoomCardProps) {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold">{t("dashboard.continue.title")}</h2>
      {room ? (
        <Card className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="accent">{getCategoryLabel(room.category, t)}</Badge>
              <span className="text-xs text-muted">
                {t("rooms.memberCount", {
                  current: room.currentUserCount,
                  max: room.maxUserCount,
                })}
              </span>
            </div>
            <h3 className="text-lg font-semibold">{room.name}</h3>
            {room.description ? (
              <p className="mt-1 line-clamp-2 text-sm text-muted">{room.description}</p>
            ) : null}
          </div>
          <Button href={`/rooms/${room.id}`} className="w-fit shrink-0">
            {t("dashboard.continue.button")}
          </Button>
        </Card>
      ) : (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{t("dashboard.continue.emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted">{t("dashboard.continue.emptyDesc")}</p>
          </div>
          <Button variant="secondary" href="/rooms" className="w-fit shrink-0">
            {t("dashboard.actions.joinRoom.button")}
          </Button>
        </Card>
      )}
    </section>
  );
}
