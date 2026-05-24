"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DashboardContinueRoom } from "@/types/dashboard";

interface DashboardQuickActionsProps {
  continueRoom: DashboardContinueRoom | null;
  onCreateRoom: () => void;
  onEnterInviteCode: () => void;
}

export function DashboardQuickActions({
  continueRoom,
  onCreateRoom,
  onEnterInviteCode,
}: DashboardQuickActionsProps) {
  const { t } = useLanguage();

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <Button onClick={onCreateRoom} className="min-h-12 justify-center">
        {t("dashboard.quickActions.createRoom")}
      </Button>

      <Button variant="secondary" href="/rooms" className="min-h-12 justify-center">
        {t("dashboard.quickActions.joinRooms")}
      </Button>

      <Button
        variant="secondary"
        onClick={onEnterInviteCode}
        className="min-h-12 justify-center"
      >
        {t("dashboard.quickActions.enterInviteCode")}
      </Button>

      {continueRoom ? (
        <Button href={`/rooms/${continueRoom.id}`} className="min-h-12 justify-center">
          {t("dashboard.quickActions.continueRoom")}
        </Button>
      ) : (
        <Button variant="secondary" href="/rooms" className="min-h-12 justify-center">
          {t("dashboard.quickActions.continueRoom")}
        </Button>
      )}
    </div>
  );
}
