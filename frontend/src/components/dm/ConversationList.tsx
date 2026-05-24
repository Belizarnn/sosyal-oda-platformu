"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { ConversationListItem } from "@/components/dm/ConversationListItem";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DMConversation } from "@/types/dm";

interface ConversationListProps {
  conversations: DMConversation[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  return (
    <div className="space-y-3">
      {conversations.map((conversation) => (
        <ConversationListItem key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}

export function ConversationListEmpty() {
  const { t } = useLanguage();

  return (
    <EmptyState
      icon="✉"
      title={t("states.empty.noMessages")}
      description={t("states.empty.noMessagesDesc")}
      actionLabel={t("messages.goToFriends")}
      href="/friends"
    />
  );
}
