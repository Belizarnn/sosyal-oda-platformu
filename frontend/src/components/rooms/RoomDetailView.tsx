"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { RoomControlBar } from "@/components/rooms/detail/RoomControlBar";
import { RoomHeader } from "@/components/rooms/detail/RoomHeader";
import { RoomInfoPanel } from "@/components/rooms/detail/RoomInfoPanel";
import { RoomJoinGate } from "@/components/rooms/detail/RoomJoinGate";
import { RoomMembersPanel } from "@/components/rooms/detail/RoomMembersPanel";
import { RoomVoiceStrip } from "@/components/rooms/detail/RoomVoiceStrip";
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

type RoomPanelId = "watch" | "members" | "info";

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
  const [activePanel, setActivePanel] = useState<RoomPanelId>("watch");
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
      setActivePanel("watch");
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
    if (activePanel === "watch" && data?.isMember) {
      trackEvent("watch_party_opened", { roomId });
    }
  }, [activePanel, data?.isMember, roomId]);

  if (loading) {
    return (
      <div className="mx-auto flex app-panel-height max-w-6xl animate-pulse flex-col gap-3">
        <div className="h-16 rounded-xl bg-surface" />
        <div className="min-h-0 flex-1 rounded-xl bg-surface" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-red-200">
        {error ?? t("rooms.notFound")}
      </div>
    );
  }

  const { members, isMember, currentUserRole } = data;
  const currentUserMember = members.find((member) => member.userId === user?.id) ?? null;

  return (
    <div className="mx-auto flex app-panel-height max-w-6xl flex-col gap-3">
      {!isMember ? (
        <>
          <RoomHeader
            data={data}
            inviteSettings={inviteSettings}
            requiresInviteForJoin={requiresInviteForJoin}
            actionLoading={actionLoading}
            actionError={actionError}
            onJoin={() => void handleJoin()}
            onLeave={() => void handleLeave()}
          />
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
        </>
      ) : (
        <>
          <RoomControlBar
            roomId={roomId}
            roomName={data.room.name}
            memberCount={data.room.currentUserCount}
            maxMembers={data.room.maxUserCount}
            inviteSettings={inviteSettings}
            canManageInvite={data.canManageInvite}
            isMember={isMember}
            actionLoading={actionLoading}
            onLeave={() => void handleLeave()}
            activePanel={activePanel}
            onPanelChange={setActivePanel}
          />

          {actionError ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {actionError}
            </p>
          ) : null}

          {activePanel === "watch" ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row">
              <div className="flex min-h-[240px] min-w-0 flex-1 flex-col">
                <div className="min-h-[220px] flex-1 overflow-hidden rounded-xl border border-border bg-surface">
                  <WatchPartyPanel
                    roomId={roomId}
                    isMember={isMember}
                    currentUserId={user?.id}
                    currentUserRole={currentUserRole}
                    members={members}
                    socket={socket}
                  />
                </div>
                <RoomVoiceStrip roomId={roomId} />
              </div>

              <div className="flex h-[360px] min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-surface lg:h-auto lg:w-80 lg:shrink-0">
                <ChatPanel
                  roomId={roomId}
                  isMember={isMember}
                  currentUserId={user?.id}
                  currentUserRole={currentUserRole}
                  members={members}
                  socket={socket}
                />
              </div>
            </div>
          ) : null}

          {activePanel === "members" ? (
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-surface">
              <RoomMembersPanel
                roomId={roomId}
                members={members}
                currentUserMember={currentUserMember}
                currentUserId={user?.id}
                onUpdated={() => void loadRoom()}
              />
            </div>
          ) : null}

          {activePanel === "info" ? (
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-border bg-surface p-4">
              <RoomInfoPanel
                data={data}
                inviteSettings={inviteSettings}
                onInviteUpdated={handleInviteUpdated}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
