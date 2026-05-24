"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DMMessageInput } from "@/components/dm/DMMessageInput";
import { DMMessageList } from "@/components/dm/DMMessageList";
import { DMTypingIndicator } from "@/components/dm/DMTypingIndicator";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingState";
import { PresenceDot } from "@/components/presence/PresenceDot";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useDmSocket } from "@/hooks/useDmSocket";
import {
  ApiError,
  deleteDmMessage,
  getDmConversations,
  getDmMessages,
  sendDmMessage,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { getToken } from "@/lib/auth";
import { getPresenceLabel, getPresenceMeta } from "@/lib/presence";
import type { DMConversation, DirectMessage } from "@/types/dm";

interface DMChatPanelProps {
  conversationId: string;
}

export function DMChatPanel({ conversationId }: DMChatPanelProps) {
  const { t } = useLanguage();
  const { user, loading: authLoading, isReady } = useRequireAuth();
  const [conversation, setConversation] = useState<DMConversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [typingUsername, setTypingUsername] = useState<string | null>(null);
  const socket = useDmSocket(conversationId, Boolean(getToken()));

  const loadConversationMeta = useCallback(async () => {
    const response = await getDmConversations();
    const match = response.conversations.find((item) => item.id === conversationId);
    setConversation(match ?? null);
    return match ?? null;
  }, [conversationId]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [meta, messagesResponse] = await Promise.all([
          loadConversationMeta(),
          getDmMessages(conversationId),
        ]);

        if (!meta) {
          setError(t("messages.accessDenied"));
          return;
        }

        trackEvent("dm_opened", { conversationId });
        setMessages(messagesResponse.messages);
        setNextCursor(messagesResponse.nextCursor);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : t("states.error.messagesLoadFailed"),
        );
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [conversationId, isReady, loadConversationMeta, t]);

  async function handleLoadOlderMessages() {
    if (!nextCursor || loadingOlder) {
      return;
    }

    setLoadingOlder(true);

    try {
      const response = await getDmMessages(conversationId, { before: nextCursor });
      setMessages((current) => [...response.messages, ...current]);
      setNextCursor(response.nextCursor);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("states.error.messagesLoadFailed"),
      );
    } finally {
      setLoadingOlder(false);
    }
  }

  useEffect(() => {
    if (!socket) {
      return;
    }

    function handleNewMessage(message: DirectMessage) {
      if (message.conversationId !== conversationId) {
        return;
      }

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        return [...current, message];
      });
    }

    function handleDeleted(payload: { conversationId: string; messageId: string }) {
      if (payload.conversationId !== conversationId) {
        return;
      }

      setMessages((current) =>
        current.filter((item) => item.id !== payload.messageId),
      );
    }

    function handleTyping(payload: {
      conversationId: string;
      user: { id: string; username: string };
      isTyping: boolean;
    }) {
      if (payload.conversationId !== conversationId) {
        return;
      }

      if (payload.user.id === user?.id) {
        return;
      }

      setTypingUsername(payload.isTyping ? payload.user.username : null);
    }

    function handleSocketError(payload: { message: string }) {
      setActionError(payload.message);
    }

    socket.on("dm:message:new", handleNewMessage);
    socket.on("dm:message:deleted", handleDeleted);
    socket.on("dm:typing:update", handleTyping);
    socket.on("dm:error", handleSocketError);

    return () => {
      socket.off("dm:message:new", handleNewMessage);
      socket.off("dm:message:deleted", handleDeleted);
      socket.off("dm:typing:update", handleTyping);
      socket.off("dm:error", handleSocketError);
    };
  }, [conversationId, socket, user?.id]);

  async function handleSend(content: string) {
    setActionError(null);

    try {
      if (socket) {
        await new Promise<void>((resolve, reject) => {
          socket.emit(
            "dm:message:send",
            { conversationId, content },
            (response) => {
              if (!response?.ok) {
                reject(
                  new Error(
                    typeof response?.message === "string"
                      ? response.message
                      : t("messages.sendFailed"),
                  ),
                );
                return;
              }

              resolve();
            },
          );
        });
        return;
      }

      const response = await sendDmMessage(conversationId, content);
      setMessages((current) => {
        if (current.some((item) => item.id === response.message.id)) {
          return current;
        }

        return [...current, response.message];
      });
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : t("messages.sendFailed"),
      );
      throw err;
    }
  }

  async function handleDeleteMessage(messageId: string) {
    setActionError(null);

    try {
      await deleteDmMessage(conversationId, messageId);
      setMessages((current) => current.filter((item) => item.id !== messageId));
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : t("messages.deleteFailed"),
      );
    }
  }

  if (authLoading) {
    return (
      <div className="mx-auto flex app-panel-height max-w-3xl animate-pulse flex-col gap-4">
        <div className="h-16 rounded-2xl bg-surface" />
        <div className="flex-1 rounded-2xl bg-surface" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="mx-auto flex app-panel-height max-w-3xl animate-pulse flex-col gap-4">
        <div className="h-16 rounded-2xl bg-surface" />
        <div className="flex-1 rounded-2xl bg-surface" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="mx-auto max-w-3xl">
        <ErrorState
          title={t("states.error.conversationNotFound")}
          description={error ?? t("messages.notFoundDesc")}
        />
      </div>
    );
  }

  const presence = getPresenceMeta(conversation.otherUser.presenceStatus);

  return (
    <div className="mx-auto flex app-panel-height max-w-3xl flex-col gap-3 sm:gap-4">
      <Card className="flex items-center gap-3">
        <Link href={`/profile/${conversation.otherUser.handle}`} className="relative">
          <Avatar
            name={conversation.otherUser.username}
            src={conversation.otherUser.avatarUrl}
            size="md"
          />
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-ring-offset">
            <PresenceDot
              status={conversation.otherUser.presenceStatus}
              className="h-2.5 w-2.5"
            />
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${conversation.otherUser.handle}`}
            className="font-medium hover:text-accent"
          >
            {conversation.otherUser.username}
          </Link>
          <p className="text-sm text-muted">@{conversation.otherUser.handle}</p>
          <p className={`text-xs ${presence.textClass}`}>
            {getPresenceLabel(conversation.otherUser.presenceStatus, t)}
          </p>
        </div>
        <Link href="/messages" className="text-sm text-muted hover:text-foreground">
          {t("messages.back")}
        </Link>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden" glow>
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

        <DMMessageList
          messages={messages}
          currentUserId={user?.id}
          onDeleteMessage={handleDeleteMessage}
        />

        <DMTypingIndicator username={typingUsername ?? undefined} />

        <DMMessageInput
          onSend={handleSend}
          onTypingStart={() => {
            socket?.emit("dm:typing:start", { conversationId });
          }}
          onTypingStop={() => {
            socket?.emit("dm:typing:stop", { conversationId });
          }}
        />
      </Card>
    </div>
  );
}
