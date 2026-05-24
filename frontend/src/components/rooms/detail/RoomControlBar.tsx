"use client";

import Link from "next/link";
import { VoiceControls } from "@/components/voice/VoiceControls";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useVoice } from "@/contexts/VoiceContext";
import { useToast } from "@/components/ui/ToastProvider";
import type { InviteSettings } from "@/types/invite";
import { cn } from "@/lib/cn";

interface RoomControlBarProps {
  roomId: string;
  roomName: string;
  memberCount: number;
  maxMembers: number;
  inviteSettings: InviteSettings | null;
  canManageInvite: boolean;
  isMember: boolean;
  actionLoading?: boolean;
  onLeave: () => void;
  activePanel: "watch" | "members" | "info";
  onPanelChange: (panel: "watch" | "members" | "info") => void;
}

export function RoomControlBar({
  roomId,
  roomName,
  memberCount,
  maxMembers,
  inviteSettings,
  canManageInvite,
  isMember,
  actionLoading = false,
  onLeave,
  activePanel,
  onPanelChange,
}: RoomControlBarProps) {
  const { t } = useLanguage();
  const { success } = useToast();
  const {
    isVoiceConnected,
    currentVoiceRoomId,
    isConnecting,
    isMuted,
    isDeafened,
    isCameraEnabled,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMicrophone,
    toggleDeafen,
    toggleCamera,
  } = useVoice();

  const connectedHere = isVoiceConnected && currentVoiceRoomId === roomId;

  async function handleCopyInvite() {
    if (!inviteSettings?.inviteUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(inviteSettings.inviteUrl);
      success(t("invite.copySuccess"));
    } catch {
      // clipboard unavailable
    }
  }

  if (!isMember) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{roomName}</p>
          <p className="text-xs text-muted">
            {t("rooms.memberCount", { current: memberCount, max: maxMembers })}
          </p>
        </div>

        {inviteSettings?.inviteEnabled && canManageInvite ? (
          <Button size="sm" variant="secondary" onClick={() => void handleCopyInvite()}>
            {t("rooms.inviteCopy")}
          </Button>
        ) : null}

        {!connectedHere ? (
          <Button
            size="sm"
            variant="secondary"
            disabled={isConnecting}
            onClick={() => void joinVoiceRoom(roomId, roomName)}
          >
            {isConnecting ? t("voice.joining") : t("voice.joinVoice")}
          </Button>
        ) : (
          <VoiceControls
            isConnected
            isMuted={isMuted}
            isDeafened={isDeafened}
            isCameraEnabled={isCameraEnabled}
            disabled={isConnecting}
            onToggleMute={() => void toggleMicrophone()}
            onToggleCamera={() => void toggleCamera()}
            onToggleDeafen={() => void toggleDeafen()}
            onDisconnect={() => void leaveVoiceRoom()}
            disconnectLabel={t("voice.leaveVoice")}
            compact
          />
        )}

        <Button size="sm" variant="secondary" onClick={onLeave} disabled={actionLoading}>
          {t("rooms.leave")}
        </Button>
      </div>

      <div className="flex gap-1 overflow-x-auto">
        {(
          [
            { id: "watch" as const, label: t("rooms.tabs.watch") },
            { id: "members" as const, label: t("rooms.tabs.members") },
            { id: "info" as const, label: t("rooms.tabs.info") },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPanelChange(item.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm transition",
              activePanel === item.id
                ? "bg-accent/15 text-foreground"
                : "text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        ))}

        <Link
          href="/rooms"
          className="ml-auto shrink-0 self-center px-2 text-xs text-muted hover:text-foreground"
        >
          {t("rooms.backToList")}
        </Link>
      </div>
    </div>
  );
}
