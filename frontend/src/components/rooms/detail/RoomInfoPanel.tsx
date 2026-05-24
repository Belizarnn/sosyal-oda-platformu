"use client";

import { InviteSettingsPanel } from "@/components/invites/InviteSettingsPanel";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getCategoryLabel,
  getRoomTypeLabel,
} from "@/i18n/utils";
import { getIntlLocale } from "@/i18n/languages";
import type { InviteSettings } from "@/types/invite";
import type { RoomDetailResponse } from "@/types/room";

interface RoomInfoPanelProps {
  data: RoomDetailResponse;
  inviteSettings: InviteSettings | null;
  onInviteUpdated: (settings: InviteSettings) => void;
}

export function RoomInfoPanel({
  data,
  inviteSettings,
  onInviteUpdated,
}: RoomInfoPanelProps) {
  const { t, locale } = useLanguage();
  const { room, owner, currentUserRole, canManageInvite } = data;
  const createdLabel = new Date(room.createdAt).toLocaleDateString(getIntlLocale(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const canManageSettings = currentUserRole === "OWNER" || currentUserRole === "MODERATOR";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-4 p-5">
        <h2 className="text-base font-semibold">{t("rooms.info.about")}</h2>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {t("rooms.create.descriptionLabel")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-foreground/90">
            {room.description ?? t("rooms.noDescription")}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {t("rooms.info.rules")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("rooms.info.rulesPlaceholder")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label={t("rooms.create.categoryLabel")} value={getCategoryLabel(room.category, t)} />
          <InfoRow label={t("rooms.roomTypeLabel")} value={getRoomTypeLabel(room.type, t)} />
          <InfoRow
            label={t("rooms.memberCountLabel")}
            value={t("rooms.memberCount", {
              current: room.currentUserCount,
              max: room.maxUserCount,
            })}
          />
          <InfoRow label={t("rooms.info.createdAt")} value={createdLabel} />
        </div>

        <div className="flex items-center gap-3 border-t border-border pt-4">
          <Avatar name={owner.username} src={owner.avatarUrl} size="sm" />
          <div>
            <p className="text-sm font-medium">{owner.username}</p>
            <p className="text-xs text-muted">@{owner.handle}</p>
          </div>
          <Badge variant="accent" className="ml-auto">
            {t("rooms.role.owner")}
          </Badge>
        </div>
      </Card>

      <div className="space-y-4">
        {canManageInvite && inviteSettings ? (
          <InviteSettingsPanel
            roomId={room.id}
            inviteCode={inviteSettings.inviteCode}
            inviteEnabled={inviteSettings.inviteEnabled}
            canManageSettings={currentUserRole === "OWNER"}
            onUpdated={onInviteUpdated}
          />
        ) : (
          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t("rooms.info.invite")}</h3>
            <p className="mt-2 text-sm text-muted">{t("rooms.info.inviteMemberHint")}</p>
          </Card>
        )}

        {canManageSettings ? (
          <Card className="p-5">
            <h3 className="text-sm font-semibold">{t("rooms.info.settings")}</h3>
            <p className="mt-2 text-sm text-muted">{t("rooms.info.settingsPlaceholder")}</p>
            <Button variant="secondary" size="sm" className="mt-4" disabled>
              {t("rooms.info.settingsButton")}
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/40 px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}
