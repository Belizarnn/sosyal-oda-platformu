"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreateCommunityModal } from "@/components/communities/CreateCommunityModal";
import { cn } from "@/lib/cn";
import { getCommunities } from "@/lib/api";
import type { CommunityListItem } from "@/types/community";

interface CommunityServerRailProps {
  activeCommunityId: string;
  onCreateServer: () => void;
}

export function CommunityServerRail({
  activeCommunityId,
  onCreateServer,
}: CommunityServerRailProps) {
  const [joined, setJoined] = useState<CommunityListItem[]>([]);

  useEffect(() => {
    void getCommunities({ limit: 50 }).then((response) => {
      setJoined(response.communities.filter((item) => item.isMember));
    });
  }, [activeCommunityId]);

  return (
    <nav
      aria-label="Sunucular"
      className="hidden w-[72px] shrink-0 flex-col items-center gap-2 border-r border-border bg-sidebar py-3 md:flex"
    >
      <Link
        href="/communities"
        title="Topluluklar"
        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface text-lg transition hover:rounded-xl hover:bg-accent-soft"
      >
        🏠
      </Link>

      <div className="h-px w-8 bg-border" />

      {joined.map((community) => {
        const active = community.id === activeCommunityId;
        const initial = community.name.trim().charAt(0).toUpperCase() || "?";
        return (
          <Link
            key={community.id}
            href={`/communities/${community.id}`}
            title={community.name}
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold transition",
              active
                ? "rounded-xl bg-accent text-accent-foreground"
                : "bg-surface text-foreground hover:rounded-xl hover:bg-accent-soft",
            )}
          >
            {community.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={community.avatarUrl}
                alt=""
                className="h-full w-full rounded-[inherit] object-cover"
              />
            ) : (
              initial
            )}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={onCreateServer}
        title="Sunucu oluştur"
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-dashed border-border text-xl text-muted transition hover:rounded-xl hover:border-accent/40 hover:text-foreground"
      >
        +
      </button>
    </nav>
  );
}

export function CommunityServerRailCreateHost({
  activeCommunityId,
}: {
  activeCommunityId: string;
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <CommunityServerRail
        activeCommunityId={activeCommunityId}
        onCreateServer={() => setCreateOpen(true)}
      />
      <CreateCommunityModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
