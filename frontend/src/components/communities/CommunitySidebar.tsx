"use client";

import Link from "next/link";
import { channelTypeIcon } from "@/components/communities/ChannelContentRenderer";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import { formatChannelLabel, groupChannelsBySection } from "@/lib/communityUi";
import type { CommunityChannel, CommunityMemberRole } from "@/types/community";

interface CommunitySidebarProps {
  communityId: string;
  communityName: string;
  channels: CommunityChannel[];
  activeChannelId: string;
  currentUserRole: CommunityMemberRole | null;
  canManageSettings?: boolean;
  onCreateChannel: () => void;
  onOpenInvite: () => void;
  onOpenSettings: () => void;
  onToggleMembers: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

function ChannelLinkList({
  channels,
  communityId,
  activeChannelId,
  onCloseMobile,
}: {
  channels: CommunityChannel[];
  communityId: string;
  activeChannelId: string;
  onCloseMobile?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {channels.map((channel) => {
        const active = channel.id === activeChannelId;
        return (
          <li key={channel.id}>
            <Link
              href={`/communities/${communityId}/channels/${channel.id}`}
              onClick={onCloseMobile}
              className={cn(
                "flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition",
                active
                  ? "bg-accent-soft font-medium text-foreground"
                  : "text-muted hover:bg-surface-hover hover:text-foreground",
              )}
            >
              <span className="w-4 shrink-0 text-center text-xs text-muted" aria-hidden>
                {channelTypeIcon(channel.type)}
              </span>
              <span className="truncate">{formatChannelLabel(channel)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function CommunitySidebar({
  communityId,
  communityName,
  channels,
  activeChannelId,
  currentUserRole,
  canManageSettings = false,
  onCreateChannel,
  onOpenInvite,
  onOpenSettings,
  onToggleMembers,
  mobileOpen = false,
  onCloseMobile,
}: CommunitySidebarProps) {
  const { t } = useLanguage();
  const canManage =
    canManageSettings ||
    currentUserRole === "OWNER" ||
    currentUserRole === "ADMIN" ||
    currentUserRole === "MODERATOR";

  const { textLike, voiceLike } = groupChannelsBySection(channels);
  const watchChannel = channels.find((channel) => channel.type === "WATCH");

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[var(--overlay)] lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onCloseMobile}
        aria-hidden
      />
      <aside
        className={cn(
          "flex w-60 shrink-0 flex-col border-r border-border bg-sidebar",
          "fixed inset-y-0 left-0 z-50 transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="border-b border-border p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href="/communities"
                className="text-xs text-muted hover:text-foreground"
                onClick={onCloseMobile}
              >
                {t("communities.backToList")}
              </Link>
              <h2 className="mt-1 truncate font-semibold">{communityName}</h2>
            </div>
            {canManage ? (
              <button
                type="button"
                onClick={onOpenSettings}
                className="rounded-lg p-1.5 text-muted hover:bg-surface-hover hover:text-foreground"
                title={t("communities.settings.title")}
              >
                ⚙
              </button>
            ) : null}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-1">
            {canManage ? (
              <>
                <Button size="sm" variant="secondary" onClick={onCreateChannel} className="text-xs">
                  {t("communities.quickActions.createChannel")}
                </Button>
                <Button size="sm" variant="secondary" onClick={onOpenInvite} className="text-xs">
                  {t("communities.quickActions.invite")}
                </Button>
              </>
            ) : null}
            {watchChannel ? (
              <Button
                size="sm"
                variant="secondary"
                href={`/communities/${communityId}/channels/${watchChannel.id}`}
                className="col-span-2 text-xs"
              >
                {t("communities.quickActions.startWatch")}
              </Button>
            ) : null}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          {textLike.length > 0 ? (
            <div className="mb-3">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {t("communities.channelSections.text")}
              </p>
              <ChannelLinkList
                channels={textLike}
                communityId={communityId}
                activeChannelId={activeChannelId}
                onCloseMobile={onCloseMobile}
              />
            </div>
          ) : null}

          {voiceLike.length > 0 ? (
            <div>
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                {t("communities.channelSections.voice")}
              </p>
              <ChannelLinkList
                channels={voiceLike}
                communityId={communityId}
                activeChannelId={activeChannelId}
                onCloseMobile={onCloseMobile}
              />
            </div>
          ) : null}
        </nav>

        <div className="border-t border-border p-2 lg:hidden">
          <Button size="sm" variant="secondary" className="w-full" onClick={onToggleMembers}>
            {t("communities.members")}
          </Button>
        </div>
      </aside>
    </>
  );
}
