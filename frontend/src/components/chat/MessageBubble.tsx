"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ChatMessage } from "@/types/message";
import { cn } from "@/lib/cn";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn?: boolean;
  canDelete?: boolean;
  canReport?: boolean;
  onDelete?: () => void;
  onReport?: () => void;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageBubble({
  message,
  isOwn = false,
  canDelete = false,
  canReport = false,
  onDelete,
  onReport,
}: MessageBubbleProps) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const showMenu = canDelete || canReport;

  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      <Avatar name={message.sender.username} size="sm" />
      <div className={cn("max-w-[75%]", isOwn && "items-end text-right")}>
        <div
          className={cn(
            "mb-1 flex items-center gap-2 text-xs text-muted",
            isOwn && "flex-row-reverse",
          )}
        >
          <span className="font-medium text-foreground/90">
            {message.sender.username}
          </span>
          <span>@{message.sender.handle}</span>
          <span>{formatTime(message.createdAt)}</span>
          {showMenu ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                className="rounded-md px-1.5 py-0.5 text-muted transition hover:bg-surface hover:text-foreground"
                aria-label={t("chat.messageMenuAria")}
              >
                ⋮
              </button>
              {menuOpen ? (
                <div
                  className={cn(
                    "absolute top-6 z-10 min-w-[140px] rounded-xl border border-border bg-dropdown p-2 shadow-lg",
                    isOwn ? "right-0" : "left-0",
                  )}
                >
                  {canDelete ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete?.();
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-surface"
                    >
                      {t("chat.deleteMessage")}
                    </button>
                  ) : null}
                  {canReport ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onReport?.();
                      }}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-surface"
                    >
                      {t("chat.report")}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div
          className={cn(
            "rounded-2xl border px-4 py-2.5 text-sm leading-relaxed",
            isOwn
              ? "border-accent/30 bg-accent/15 text-foreground"
              : "border-border bg-surface text-foreground/90",
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
