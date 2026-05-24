"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { SystemMessage } from "@/components/chat/SystemMessage";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { canDeleteMessage } from "@/lib/permissions";
import type { ChatMessage, ChatSystemEvent } from "@/types/message";
import type { RoomMember, RoomMemberRole } from "@/types/room";

interface MessageListProps {
  messages: ChatMessage[];
  systemEvents: ChatSystemEvent[];
  currentUserId?: string | null;
  currentUserRole?: RoomMemberRole | null;
  members?: RoomMember[];
  loading?: boolean;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onReportMessage?: (message: ChatMessage) => void;
}

function buildTimeline(
  messages: ChatMessage[],
  systemEvents: ChatSystemEvent[],
) {
  return [
    ...messages.map((message) => ({
      kind: "message" as const,
      id: message.id,
      createdAt: new Date(message.createdAt).getTime(),
      message,
    })),
    ...systemEvents.map((event) => ({
      kind: "system" as const,
      id: event.id,
      createdAt: new Date(event.createdAt).getTime(),
      event,
    })),
  ].sort((a, b) => a.createdAt - b.createdAt);
}

export function MessageList({
  messages,
  systemEvents,
  currentUserId,
  currentUserRole,
  members = [],
  loading = false,
  onDeleteMessage,
  onReportMessage,
}: MessageListProps) {
  const { t } = useLanguage();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, systemEvents]);

  if (loading) {
    return <LoadingSpinner label={t("chat.loading")} />;
  }

  if (messages.length === 0 && systemEvents.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <EmptyState
          icon="✉"
          title={t("chat.empty")}
          description={t("chat.emptyFirstMessage")}
          className="w-full max-w-sm border-0 bg-transparent shadow-none"
        />
      </div>
    );
  }

  const timeline = buildTimeline(messages, systemEvents);

  return (
    <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4">
      {timeline.map((item) => {
        if (item.kind === "system") {
          const text =
            item.event.type === "joined"
              ? t("chat.systemJoined", { username: item.event.user.username })
              : t("chat.systemLeft", { username: item.event.user.username });

          return <SystemMessage key={item.id} text={text} />;
        }

        const isOwn = item.message.sender.id === currentUserId;
        const deletable = canDeleteMessage(
          currentUserId,
          item.message,
          currentUserRole,
          members,
        );

        return (
          <MessageBubble
            key={item.id}
            message={item.message}
            isOwn={isOwn}
            canDelete={deletable}
            canReport={!isOwn}
            onDelete={
              onDeleteMessage
                ? () => void onDeleteMessage(item.message.id)
                : undefined
            }
            onReport={
              onReportMessage
                ? () => onReportMessage(item.message)
                : undefined
            }
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
