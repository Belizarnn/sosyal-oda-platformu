"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import type { RoomType } from "@/types/room";

interface RoomJoinGateProps {
  roomName: string;
  roomType: RoomType;
  requiresInviteForJoin: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  actionLoading: boolean;
  actionError: string | null;
  onJoin: () => void;
}

export function RoomJoinGate({
  roomName,
  roomType,
  requiresInviteForJoin,
  password,
  onPasswordChange,
  actionLoading,
  actionError,
  onJoin,
}: RoomJoinGateProps) {
  const { t } = useLanguage();

  return (
    <Card glow className="mx-auto max-w-lg p-8 text-center">
      <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-2xl">
        ◎
      </span>
      <h2 className="text-xl font-semibold">{t("rooms.joinGate.title")}</h2>
      <p className="mt-2 text-sm text-muted">
        {t("rooms.joinGate.subtitle", { name: roomName })}
      </p>

      {requiresInviteForJoin ? (
        <p className="mt-4 text-sm text-amber-200">{t("rooms.inviteRequired")}</p>
      ) : (
        <>
          {roomType === "PASSWORD_PROTECTED" ? (
            <div className="mt-6 text-left">
              <Input
                label={t("rooms.passwordLabel")}
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={t("rooms.passwordJoinPlaceholder")}
              />
            </div>
          ) : null}

          {actionError ? (
            <p className="mt-4 text-sm text-red-300">{actionError}</p>
          ) : null}

          <Button
            size="lg"
            className="mt-6 min-w-[200px]"
            onClick={onJoin}
            disabled={actionLoading || requiresInviteForJoin}
          >
            {actionLoading ? t("rooms.joining") : t("rooms.joinGate.button")}
          </Button>
        </>
      )}
    </Card>
  );
}
