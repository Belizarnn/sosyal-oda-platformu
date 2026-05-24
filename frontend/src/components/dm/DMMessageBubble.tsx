"use client";

import type { DirectMessage } from "@/types/dm";
import { Avatar } from "@/components/ui/Avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface DMMessageBubbleProps {
  message: DirectMessage;
  isOwn?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DMMessageBubble({
  message,
  isOwn = false,
  canDelete = false,
  onDelete,
}: DMMessageBubbleProps) {
  const { t } = useLanguage();

  return (
    <div className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
      <Avatar
        name={message.sender.username}
        src={message.sender.avatarUrl}
        size="sm"
      />
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
          <span>{formatTime(message.createdAt)}</span>
          {canDelete && onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md px-1.5 py-0.5 text-muted transition hover:bg-surface hover:text-red-300"
              aria-label={t("dm.deleteMessage")}
            >
              {t("dm.delete")}
            </button>
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
