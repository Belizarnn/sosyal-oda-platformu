"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { MessageInput } from "@/components/chat/MessageInput";
import { MessageList } from "@/components/chat/MessageList";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ReportModal } from "@/components/moderation/ReportModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, deleteRoomMessage, getRoomMessages } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { AppSocket } from "@/lib/socket";
import type {
  ChatMessage,
  ChatSystemEvent,
  SocketUserEvent,
  TypingUser,
} from "@/types/message";
import type { RoomMember, RoomMemberRole } from "@/types/room";

interface ChatPanelProps {
  roomId: string;
  isMember: boolean;
  canSendMessages?: boolean;
  currentUserId?: string | null;
  currentUserRole?: RoomMemberRole | null;
  members?: RoomMember[];
  socket: AppSocket | null;
}

export function ChatPanel({
  roomId,
  isMember,
  canSendMessages = true,
  currentUserId,
  currentUserRole,
  members = [],
  socket,
}: ChatPanelProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [systemEvents, setSystemEvents] = useState<ChatSystemEvent[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(
    new Map(),
  );
  const [loading, setLoading] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reportMessage, setReportMessage] = useState<ChatMessage | null>(null);

  const appendSystemEvent = useCallback(
    (type: ChatSystemEvent["type"], user: ChatSystemEvent["user"]) => {
      if (user.id === currentUserId) {
        return;
      }

      setSystemEvents((prev) => [
        ...prev,
        {
          id: `${type}-${user.id}-${Date.now()}`,
          type,
          roomId,
          user,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    [currentUserId, roomId],
  );

  const loadMessages = useCallback(async () => {
    if (!isMember || !getToken()) {
      return;
    }

    setLoading(true);
    setHistoryError(null);

    try {
      const history = await getRoomMessages(roomId);
      setMessages(history.messages);
      setNextCursor(history.nextCursor);
    } catch (error) {
      setHistoryError(
        error instanceof ApiError ? error.message : t("chat.historyLoadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [isMember, roomId, t]);

  async function handleLoadOlderMessages() {
    if (!nextCursor || loadingOlder) {
      return;
    }

    setLoadingOlder(true);

    try {
      const history = await getRoomMessages(roomId, { before: nextCursor });
      setMessages((current) => [...history.messages, ...current]);
      setNextCursor(history.nextCursor);
    } catch (error) {
      setHistoryError(
        error instanceof ApiError ? error.message : t("chat.historyLoadFailed"),
      );
    } finally {
      setLoadingOlder(false);
    }
  }

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleMessageNew = (message: ChatMessage) => {
      if (message.roomId !== roomId) {
        return;
      }

      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }

        return [...prev, message];
      });
    };

    const handleMessageDeleted = (payload: {
      roomId: string;
      messageId: string;
    }) => {
      if (payload.roomId !== roomId) {
        return;
      }

      setMessages((prev) =>
        prev.filter((message) => message.id !== payload.messageId),
      );
    };

    const handleUserJoined = (payload: SocketUserEvent) => {
      if (payload.roomId !== roomId) {
        return;
      }

      appendSystemEvent("joined", payload.user);
    };

    const handleUserLeft = (payload: SocketUserEvent) => {
      if (payload.roomId !== roomId) {
        return;
      }

      appendSystemEvent("left", payload.user);
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(payload.user.id);
        return next;
      });
    };

    const handleTypingUpdate = (payload: {
      roomId: string;
      user: TypingUser;
      isTyping: boolean;
    }) => {
      if (payload.roomId !== roomId || payload.user.id === currentUserId) {
        return;
      }

      setTypingUsers((prev) => {
        const next = new Map(prev);

        if (payload.isTyping) {
          next.set(payload.user.id, payload.user);
        } else {
          next.delete(payload.user.id);
        }

        return next;
      });
    };

    socket.on("message:new", handleMessageNew);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("user:joined", handleUserJoined);
    socket.on("user:left", handleUserLeft);
    socket.on("typing:update", handleTypingUpdate);

    return () => {
      socket.off("message:new", handleMessageNew);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("user:joined", handleUserJoined);
      socket.off("user:left", handleUserLeft);
      socket.off("typing:update", handleTypingUpdate);
      setTypingUsers(new Map());
    };
  }, [appendSystemEvent, currentUserId, roomId, socket]);

  async function handleDeleteMessage(messageId: string) {
    setActionError(null);

    try {
      await deleteRoomMessage(roomId, messageId);
      setMessages((prev) => prev.filter((message) => message.id !== messageId));
    } catch (error) {
      setActionError(
        error instanceof ApiError ? error.message : t("messages.deleteFailed"),
      );
    }
  }

  async function handleSend(content: string) {
    if (!socket) {
      throw new Error("Socket bağlantısı yok");
    }

    setActionError(null);

    await new Promise<void>((resolve, reject) => {
      socket.emit(
        "message:send",
        { roomId, content, replyToMessageId: null },
        (response) => {
          if (response?.ok) {
            resolve();
            return;
          }

          reject(new Error(response?.message ?? t("messages.sendFailed")));
        },
      );
    });
  }

  function handleTypingStart() {
    socket?.emit("typing:start", { roomId });
  }

  function handleTypingStop() {
    socket?.emit("typing:stop", { roomId });
  }

  const currentMember = members.find(
    (member) => member.userId === currentUserId,
  );
  const isMuted = currentMember?.isMuted ?? false;

  const token = getToken();
  const inputDisabled = !token || !isMember || !canSendMessages || !socket || isMuted;
  const disabledMessage = !token
    ? t("chat.loginRequired")
    : !isMember
      ? t("chat.memberRequired")
      : isMuted
        ? t("chat.mutedInRoom")
        : !socket
          ? t("chat.connecting")
          : undefined;

  return (
    <>
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_0_40px_var(--glow)]">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">{t("rooms.chat")}</h2>
          <p className="text-xs text-muted">{t("chat.subtitle")}</p>
        </div>

        {historyError ? (
          <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {historyError}
          </div>
        ) : null}

        {actionError ? (
          <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {actionError}
          </div>
        ) : null}

        {nextCursor ? (
          <div className="border-b border-border px-4 py-2">
            <Button
              variant="ghost"
              className="w-full text-xs"
              disabled={loadingOlder}
              onClick={() => void handleLoadOlderMessages()}
            >
              {loadingOlder ? t("common.loading") : t("chat.loadOlder")}
            </Button>
          </div>
        ) : null}

        <MessageList
          messages={messages}
          systemEvents={systemEvents}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          members={members}
          loading={loading}
          onDeleteMessage={handleDeleteMessage}
          onReportMessage={setReportMessage}
        />

        <TypingIndicator users={Array.from(typingUsers.values())} />

        <MessageInput
          disabled={inputDisabled}
          disabledMessage={disabledMessage}
          onSend={handleSend}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
        />
      </section>

      <ReportModal
        open={Boolean(reportMessage)}
        targetType="MESSAGE"
        targetMessageId={reportMessage?.id}
        targetRoomId={roomId}
        onClose={() => setReportMessage(null)}
      />
    </>
  );
}
