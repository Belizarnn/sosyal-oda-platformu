"use client";

import { ChatPanel } from "@/components/chat/ChatPanel";
import { VoicePanel } from "@/components/voice/VoicePanel";
import { WatchPartyPanel } from "@/components/watch/WatchPartyPanel";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AppSocket } from "@/lib/socket";
import type { CommunityChannel, CommunityMember, CommunityMemberRole } from "@/types/community";
import type { RoomMemberRole } from "@/types/room";

interface ChannelContentRendererProps {
  channel: CommunityChannel;
  communityName: string;
  isMember: boolean;
  currentUserId?: string | null;
  currentUserRole: CommunityMemberRole | null;
  members: CommunityMember[];
  socket: AppSocket | null;
}

function mapCommunityRoleToRoomRole(role: CommunityMemberRole | null): RoomMemberRole | null {
  if (!role) return null;
  if (role === "OWNER") return "OWNER";
  if (role === "ADMIN" || role === "MODERATOR") return "MODERATOR";
  return "MEMBER";
}

function canSendInChannel(
  channel: CommunityChannel,
  role: CommunityMemberRole | null,
): boolean {
  if (!role) return false;
  if (channel.type === "ANNOUNCEMENT") {
    return role === "OWNER" || role === "ADMIN" || role === "MODERATOR";
  }
  return true;
}

function channelTypeIcon(type: CommunityChannel["type"]): string {
  switch (type) {
    case "TEXT":
      return "#";
    case "VOICE":
      return "♪";
    case "VIDEO":
      return "▣";
    case "WATCH":
      return "▶";
    case "ANNOUNCEMENT":
      return "!";
    case "PRIVATE":
      return "🔒";
    default:
      return "#";
  }
}

export function ChannelHeader({
  channel,
  communityName,
}: {
  channel: CommunityChannel;
  communityName: string;
}) {
  const { t } = useLanguage();

  return (
    <header className="flex items-center gap-2 border-b border-border px-3 py-2">
      <span className="text-muted" aria-hidden>
        {channelTypeIcon(channel.type)}
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{channel.name}</p>
        <p className="truncate text-xs text-muted">
          {communityName} · {t(`communities.channelTypes.${channel.type.toLowerCase()}`)}
        </p>
      </div>
    </header>
  );
}

export function ChannelContentRenderer({
  channel,
  communityName,
  isMember,
  currentUserId,
  currentUserRole,
  members,
  socket,
}: ChannelContentRendererProps) {
  const { t } = useLanguage();
  const roomId = channel.backingRoomId;
  const roomMemberRole = mapCommunityRoleToRoomRole(currentUserRole);
  const canSend = canSendInChannel(channel, currentUserRole);

  if (!roomId) {
    return (
      <Card className="m-3 p-4">
        <p className="text-sm text-muted">{t("communities.channelUnavailable")}</p>
      </Card>
    );
  }

  if (!isMember) {
    return (
      <Card className="m-3 p-4">
        <p className="text-sm text-muted">{t("communities.joinRequired")}</p>
      </Card>
    );
  }

  if (channel.type === "WATCH") {
    return (
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-[240px] flex-1 overflow-hidden">
          <WatchPartyPanel
            roomId={roomId}
            isMember={isMember}
            currentUserId={currentUserId}
            currentUserRole={roomMemberRole}
            members={[]}
            socket={socket}
          />
        </div>
        <div className="h-[320px] border-t border-border lg:h-auto lg:w-72 lg:border-l lg:border-t-0">
          <ChatPanel
            roomId={roomId}
            isMember={isMember}
            canSendMessages={canSend}
            currentUserId={currentUserId}
            currentUserRole={roomMemberRole}
            members={[]}
            socket={socket}
          />
        </div>
      </div>
    );
  }

  if (channel.type === "VOICE" || channel.type === "VIDEO") {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-3">
        <VoicePanel
          roomId={roomId}
          roomName={channel.name}
          isMember={isMember}
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatPanel
        roomId={roomId}
        isMember={isMember}
        canSendMessages={canSend}
        currentUserId={currentUserId}
        currentUserRole={roomMemberRole}
        members={[]}
        socket={socket}
      />
    </div>
  );
}

export { channelTypeIcon };
