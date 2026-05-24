"use client";

import { useEffect, useRef } from "react";
import type { DirectMessage } from "@/types/dm";
import { DMMessageBubble } from "@/components/dm/DMMessageBubble";

interface DMMessageListProps {
  messages: DirectMessage[];
  currentUserId?: string | null;
  onDeleteMessage?: (messageId: string) => void;
}

export function DMMessageList({
  messages,
  currentUserId,
  onDeleteMessage,
}: DMMessageListProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted">
        Henüz mesaj yok. İlk mesajı sen gönder.
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain p-4">
      {messages.map((message) => (
        <DMMessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender.id === currentUserId}
          canDelete={message.sender.id === currentUserId}
          onDelete={
            onDeleteMessage ? () => onDeleteMessage(message.id) : undefined
          }
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
