"use client";

import Link from "next/link";
import { channelTypeIcon } from "@/components/communities/ChannelContentRenderer";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import type { CommunityChannel, CommunityMemberRole } from "@/types/community";

interface CommunitySidebarProps {
  communityId: string;
  communityName: string;
  channels: CommunityChannel[];
  activeChannelId: string;
  currentUserRole: CommunityMemberRole | null;
  onCreateChannel: () => void;
  onOpenInvite: () => void;
  onToggleMembers: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function CommunitySidebar({
  communityId,
  communityName,
  channels,
  activeChannelId,
  currentUserRole,
  onCreateChannel,
  onOpenInvite,
  onToggleMembers,
  mobileOpen = false,
  onCloseMobile,
}: CommunitySidebarProps) {
  const { t } = useLanguage();
  const canManage =
    currentUserRole === "OWNER" ||
    currentUserRole === "ADMIN" ||
    currentUserRole === "MODERATOR";

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
          "flex w-64 shrink-0 flex-col border-r border-border bg-sidebar",
          "fixed inset-y-0 left-0 z-50 transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="border-b border-border p-3">
          <Link
            href="/communities"
            className="text-xs text-muted hover:text-foreground"
            onClick={onCloseMobile}
          >
            {t("communities.backToList")}
          </Link>
          <h2 className="mt-1 truncate font-semibold">{communityName}</h2>
          <div className="mt-2 flex flex-wrap gap-1">
            {canManage ? (
              <>
                <Button size="sm" variant="secondary" onClick={onCreateChannel}>
                  {t("communities.createChannel")}
                </Button>
                <Button size="sm" variant="secondary" onClick={onOpenInvite}>
                  {t("communities.invite")}
                </Button>
              </>
            ) : null}
            <Button size="sm" variant="secondary" onClick={onToggleMembers} className="lg:hidden">
              {t("communities.members")}
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-2">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted">
            {t("communities.channels")}
          </p>
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
                    <span className="truncate">{channel.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
