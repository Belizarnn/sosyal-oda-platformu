"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/presence/PresenceDot";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatShortRelative } from "@/lib/formatDate";
import type { DMConversation } from "@/types/dm";

interface ConversationListItemProps {
  conversation: DMConversation;
}

function formatRelativeTime(value: string): string {
  return formatShortRelative(value);
}

export function ConversationListItem({ conversation }: ConversationListItemProps) {
  const { t } = useLanguage();
  const { otherUser, lastMessage } = conversation;

  return (
    <Link href={`/messages/${conversation.id}`}>
      <Card className="flex items-center gap-3 transition hover:border-accent/30">
        <div className="relative shrink-0">
          <Avatar name={otherUser.username} src={otherUser.avatarUrl} size="md" />
          <span className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-ring-offset">
            <PresenceDot status={otherUser.presenceStatus} className="h-2.5 w-2.5" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate font-medium">{otherUser.username}</p>
            <span className="shrink-0 text-xs text-muted">
              {formatRelativeTime(conversation.updatedAt)}
            </span>
          </div>
          <p className="truncate text-sm text-muted">@{otherUser.handle}</p>
          <p className="mt-1 truncate text-sm text-foreground/80">
            {lastMessage?.content ?? t("dm.noMessagesPreview")}
          </p>
        </div>
      </Card>
    </Link>
  );
}
