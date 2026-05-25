"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChannelContentRenderer,
  ChannelHeader,
} from "@/components/communities/ChannelContentRenderer";
import { CommunityInviteModal } from "@/components/communities/CommunityInviteModal";
import { CommunityMemberList } from "@/components/communities/CommunityMemberList";
import { CommunityServerRailCreateHost } from "@/components/communities/CommunityServerRail";
import { CommunitySettingsModal } from "@/components/communities/CommunitySettingsModal";
import { CommunitySidebar } from "@/components/communities/CommunitySidebar";
import { CreateChannelModal } from "@/components/communities/CreateChannelModal";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/hooks/useAuth";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  getCommunityById,
  getCommunityChannel,
  joinCommunity,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type {
  CommunityChannel,
  CommunityDetailResponse,
  CommunityMember,
} from "@/types/community";

interface CommunityChannelViewProps {
  communityId: string;
  channelId: string;
}

export function CommunityChannelView({ communityId, channelId }: CommunityChannelViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [community, setCommunity] = useState<CommunityDetailResponse | null>(null);
  const [channel, setChannel] = useState<CommunityChannel | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);
  const [createChannelOpen, setCreateChannelOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const backingRoomId = channel?.backingRoomId ?? "";
  const isMember = Boolean(community?.isMember);
  const socket = useRoomSocket(backingRoomId, Boolean(isMember && backingRoomId && getToken()));

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [communityResponse, channelResponse] = await Promise.all([
        getCommunityById(communityId),
        getCommunityChannel(communityId, channelId),
      ]);
      setCommunity(communityResponse);
      setChannel(channelResponse.channel);
      setMembers(channelResponse.members);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("states.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [communityId, channelId, t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleJoin() {
    setJoinLoading(true);
    try {
      await joinCommunity(communityId);
      await loadData();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.joinFailed"));
    } finally {
      setJoinLoading(false);
    }
  }

  if (loading) {
    return <LoadingState label={t("states.loading.default")} rows={3} className="min-h-[50vh]" />;
  }

  if (error || !community || !channel) {
    return (
      <ErrorState
        title={t("states.error.loadFailed")}
        description={error ?? t("communities.notFound")}
        onRetry={() => void loadData()}
      />
    );
  }

  return (
    <div className="flex app-panel-height overflow-hidden rounded-xl border border-border bg-surface">
      <CommunityServerRailCreateHost activeCommunityId={communityId} />

      <CommunitySidebar
        communityId={communityId}
        communityName={community.community.name}
        channels={community.channels}
        activeChannelId={channelId}
        currentUserRole={community.currentUserRole}
        canManageSettings={community.canManageSettings}
        onCreateChannel={() => setCreateChannelOpen(true)}
        onOpenInvite={() => setInviteOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleMembers={() => setMembersOpen(true)}
        mobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-2 py-2 lg:hidden">
          <Button size="sm" variant="secondary" onClick={() => setSidebarOpen(true)}>
            {t("communities.channels")}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setMembersOpen(true)}>
            {t("communities.members")}
          </Button>
        </div>

        {!isMember ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-muted">{t("communities.joinPrompt")}</p>
            <Button onClick={() => void handleJoin()} disabled={joinLoading}>
              {joinLoading ? t("common.loading") : t("communities.join")}
            </Button>
            <Button variant="secondary" onClick={() => router.push("/communities")}>
              {t("communities.backToList")}
            </Button>
          </div>
        ) : (
          <>
            <ChannelHeader channel={channel} communityName={community.community.name} />
            <ChannelContentRenderer
              channel={channel}
              communityName={community.community.name}
              isMember={isMember}
              currentUserId={user?.id}
              currentUserRole={community.currentUserRole}
              members={members}
              socket={socket}
            />
          </>
        )}
      </div>

      <CommunityMemberList members={members} inline />

      <CommunityMemberList
        members={members}
        open={membersOpen}
        onClose={() => setMembersOpen(false)}
      />

      <CreateChannelModal
        communityId={communityId}
        open={createChannelOpen}
        onClose={() => setCreateChannelOpen(false)}
        onCreated={(newChannelId) => {
          void loadData();
          router.push(`/communities/${communityId}/channels/${newChannelId}`);
        }}
      />

      <CommunitySettingsModal
        communityId={communityId}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onUpdated={() => void loadData()}
      />

      <CommunityInviteModal
        communityId={communityId}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </div>
  );
}
