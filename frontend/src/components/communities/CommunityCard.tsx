"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CommunityListItem } from "@/types/community";

interface CommunityCardProps {
  community: CommunityListItem;
  onOpen: () => void;
}

export function CommunityCard({ community, onOpen }: CommunityCardProps) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-xl border border-border bg-surface p-4 text-left transition hover:bg-surface-hover"
    >
      <div className="flex items-start gap-3">
        <Avatar name={community.name} src={community.avatarUrl} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold">{community.name}</h3>
            {community.isMember ? (
              <Badge variant="accent">{t("communities.memberBadge")}</Badge>
            ) : null}
          </div>
          {community.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{community.description}</p>
          ) : null}
          <p className="mt-2 text-xs text-muted">
            {t("communities.meta", {
              members: community.memberCount,
              channels: community.channelCount,
            })}
          </p>
        </div>
      </div>
    </button>
  );
}
