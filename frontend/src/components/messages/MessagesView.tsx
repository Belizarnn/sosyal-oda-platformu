"use client";

import { useEffect, useState } from "react";
import {
  ConversationList,
  ConversationListEmpty,
} from "@/components/dm/ConversationList";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { ApiError, getDmConversations } from "@/lib/api";
import type { DMConversation } from "@/types/dm";

export function MessagesView() {
  const { t } = useLanguage();
  const { user, loading: authLoading, isReady } = useRequireAuth();
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function loadConversations() {
      setLoading(true);
      setError(null);

      try {
        const response = await getDmConversations();
        setConversations(response.conversations);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : t("states.error.messagesLoadFailed"),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadConversations();
  }, [isReady, t]);

  if (authLoading || loading) {
    return (
      <LoadingState
        label={t("states.loading.messages")}
        rows={2}
        className="mx-auto max-w-3xl"
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("messages.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("messages.subtitleConversations")}</p>
        </div>
        <Button href="/friends">{t("messages.newMessage")}</Button>
      </div>

      {error ? (
        <ErrorState
          title={t("states.error.messagesLoadFailed")}
          description={error}
        />
      ) : conversations.length === 0 ? (
        <ConversationListEmpty />
      ) : (
        <ConversationList conversations={conversations} />
      )}
    </div>
  );
}
