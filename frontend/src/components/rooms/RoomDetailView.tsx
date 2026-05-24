"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { RoomHeader } from "@/components/rooms/detail/RoomHeader";
import { RoomInfoPanel } from "@/components/rooms/detail/RoomInfoPanel";
import { RoomJoinGate } from "@/components/rooms/detail/RoomJoinGate";
import { RoomMembersPanel } from "@/components/rooms/detail/RoomMembersPanel";
import { RoomTabs, type RoomTabId } from "@/components/rooms/detail/RoomTabs";
import { VoicePanel } from "@/components/voice/VoicePanel";
import { WatchPartyPanel } from "@/components/watch/WatchPartyPanel";
import { useAuth } from "@/hooks/useAuth";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  getRoomById,
  joinRoom,
  leaveRoom,
  updatePresence,
  type RoomDetailResponse,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { getToken } from "@/lib/auth";
import { APP_BASE_URL } from "@/lib/env";
import type { InviteSettings } from "@/types/invite";

interface RoomDetailViewProps {
  roomId: string;
  inviteCodeFromUrl?: string;
}

async function syncRoomPresence(
  roomName: string,
  onUserUpdated?: (user: Awaited<ReturnType<typeof updatePresence>>["user"]) => void,
) {
  try {
    const response = await updatePresence({
      presenceStatus: "IN_ROOM",
      statusMessage: `${roomName} odasında`,
    });
    onUserUpdated?.(response.user);
  } catch {
    // presence sync is best-effort
  }
}

export function RoomDetailView({ roomId, inviteCodeFromUrl }: RoomDetailViewProps) {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState<RoomDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<RoomTabId>("chat");
  const [inviteSettings, setInviteSettings] = useState<InviteSettings | null>(null);
  const presenceSyncedRef = useRef<string | null>(null);

  const socket = useRoomSocket(roomId, Boolean(data?.isMember && getToken()));

  const loadRoom = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRoomById(roomId);
      setData(response);

      if (response.canManageInvite && response.room.inviteCode) {
        setInviteSettings({
          inviteCode: response.room.inviteCode,
          inviteUrl: `${APP_BASE_URL.replace(/\/$/, "")}/invite/${response.room.inviteCode}`,
          inviteEnabled: response.room.inviteEnabled,
          inviteUpdatedAt: response.room.inviteUpdatedAt ?? null,
        });
      } else {
        setInviteSettings(null);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("rooms.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [roomId, t]);

  useEffect(() => {
    void loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    if (!data?.isMember || !user) {
      return;
    }

    const syncKey = `${roomId}:${user.id}`;
    if (presenceSyncedRef.current === syncKey) {
      return;
    }

    presenceSyncedRef.current = syncKey;
    void syncRoomPresence(data.room.name, (updatedUser) => setUser(updatedUser));
  }, [data?.isMember, data?.room.name, roomId, setUser, user]);

  const requiresInviteForJoin =
    data?.room.type === "INVITE_ONLY" && !inviteCodeFromUrl;

  async function handleJoin() {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    if (requiresInviteForJoin) {
      setActionError(t("rooms.inviteRequired"));
      return;
    }

    setActionLoading(true);
    setActionError(null);
    trackEvent("room_join_clicked", { roomId, source: "room_detail" });

    try {
      const response = await joinRoom(roomId, {
        password: data?.room.type === "PASSWORD_PROTECTED" ? password : undefined,
        inviteCode: data?.room.type === "INVITE_ONLY" ? inviteCodeFromUrl : undefined,
      });
      setData(response);
      setPassword("");
      setActiveTab("chat");
      await syncRoomPresence(response.room.name, (updatedUser) => setUser(updatedUser));
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("rooms.joinFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    setActionLoading(true);
    setActionError(null);

    try {
      await leaveRoom(roomId);
      presenceSyncedRef.current = null;
      await loadRoom();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t("rooms.leaveFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  function handleInviteUpdated(settings: InviteSettings) {
    setInviteSettings(settings);
    setData((current) =>
      current
        ? {
            ...current,
            room: {
              ...current.room,
              inviteCode: settings.inviteCode,
              inviteEnabled: settings.inviteEnabled,
              inviteUpdatedAt: settings.inviteUpdatedAt,
            },
          }
        : current,
    );
  }

  useEffect(() => {
    if (activeTab === "watch") {
      trackEvent("watch_party_opened", { roomId });
    }
  }, [activeTab, roomId]);

  if (loading) {
    return (
      <div className="mx-auto flex app-panel-height max-w-6xl animate-pulse flex-col gap-4">
        <div className="h-40 rounded-2xl bg-surface" />
        <div className="h-12 rounded-2xl bg-surface" />
        <div className="min-h-0 flex-1 rounded-2xl bg-surface" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-200">
        {error ?? t("rooms.notFound")}
      </div>
    );
  }

  const { members, isMember, currentUserRole } = data;
  const currentUserMember = members.find((member) => member.userId === user?.id) ?? null;

  return (
    <div className="mx-auto flex app-panel-height max-w-6xl flex-col gap-3 sm:gap-4">
      <RoomHeader
        data={data}
        inviteSettings={inviteSettings}
        requiresInviteForJoin={requiresInviteForJoin}
        actionLoading={actionLoading}
        actionError={isMember ? actionError : null}
        onJoin={() => void handleJoin()}
        onLeave={() => void handleLeave()}
      />

      {!isMember ? (
        <RoomJoinGate
          roomName={data.room.name}
          roomType={data.room.type}
          requiresInviteForJoin={requiresInviteForJoin}
          password={password}
          onPasswordChange={setPassword}
          actionLoading={actionLoading}
          actionError={actionError}
          onJoin={() => void handleJoin()}
        />
      ) : (
        <>
          <RoomTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="min-h-0 flex-1">
            {activeTab === "chat" ? (
              <ChatPanel
                roomId={roomId}
                isMember={isMember}
                currentUserId={user?.id}
                currentUserRole={currentUserRole}
                members={members}
                socket={socket}
              />
            ) : null}

            {activeTab === "voice" ? (
              <div className="h-full min-h-[280px] sm:min-h-[360px]">
                <VoicePanel
                  roomId={roomId}
                  roomName={data.room.name}
                  isMember={isMember}
                  startMicMuted={Boolean(currentUserMember?.isMuted)}
                />
              </div>
            ) : null}

            {activeTab === "watch" ? (
              <div className="h-full min-h-[280px] overflow-hidden sm:min-h-[360px]">
                <WatchPartyPanel
                  roomId={roomId}
                  isMember={isMember}
                  currentUserId={user?.id}
                  currentUserRole={currentUserRole}
                  members={members}
                  socket={socket}
                />
              </div>
            ) : null}

            {activeTab === "members" ? (
              <RoomMembersPanel
                roomId={roomId}
                members={members}
                currentUserMember={currentUserMember}
                currentUserId={user?.id}
                onUpdated={() => void loadRoom()}
              />
            ) : null}

            {activeTab === "info" ? (
              <RoomInfoPanel
                data={data}
                inviteSettings={inviteSettings}
                onInviteUpdated={handleInviteUpdated}
              />
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
