"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  acceptFriendRequest,
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  rejectFriendRequest,
  sendFriendRequest,
  startDirectConversation,
} from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { FriendRequest } from "@/types/friend";

interface FriendActionButtonProps {
  profileUserId: string;
  profileHandle: string;
}

type FriendState =
  | "none"
  | "friend"
  | "outgoing"
  | "incoming"
  | "loading";

export function FriendActionButton({
  profileUserId,
  profileHandle,
}: FriendActionButtonProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [state, setState] = useState<FriendState>("loading");
  const [incomingRequest, setIncomingRequest] = useState<FriendRequest | null>(
    null,
  );
  const [outgoingRequest, setOutgoingRequest] = useState<FriendRequest | null>(
    null,
  );
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      if (!getToken()) {
        setState("none");
        return;
      }

      try {
        const [friendsResponse, incomingResponse, outgoingResponse] =
          await Promise.all([
            getFriends(),
            getIncomingFriendRequests(),
            getOutgoingFriendRequests(),
          ]);

        const isFriend = friendsResponse.friends.some(
          (friend) => friend.id === profileUserId,
        );

        if (isFriend) {
          setState("friend");
          return;
        }

        const incoming = incomingResponse.requests.find(
          (request) => request.sender?.id === profileUserId,
        );

        if (incoming) {
          setIncomingRequest(incoming);
          setState("incoming");
          return;
        }

        const outgoing = outgoingResponse.requests.find(
          (request) => request.receiver?.id === profileUserId,
        );

        if (outgoing) {
          setOutgoingRequest(outgoing);
          setState("outgoing");
          return;
        }

        setState("none");
      } catch {
        setState("none");
      }
    }

    void loadStatus();
  }, [profileUserId]);

  async function handleSendRequest() {
    if (!getToken()) {
      setError(t("friends.loginRequired"));
      return;
    }

    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await sendFriendRequest(profileHandle);

      if (result.autoAccepted) {
        setState("friend");
        setMessage(t("friends.mutualAccepted"));
        return;
      }

      setOutgoingRequest(result.request);
      setState("outgoing");
      setMessage(t("friends.requestSent"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.sendFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAccept() {
    if (!incomingRequest) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await acceptFriendRequest(incomingRequest.id);
      setState("friend");
      setMessage(t("friends.requestAccepted"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.acceptFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject() {
    if (!incomingRequest) {
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      await rejectFriendRequest(incomingRequest.id);
      setIncomingRequest(null);
      setState("none");
      setMessage(t("friends.requestRejected"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.rejectFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMessage() {
    setActionLoading(true);
    setError(null);

    try {
      const { conversation } = await startDirectConversation({
        userId: profileUserId,
      });
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.startChatFailed"));
    } finally {
      setActionLoading(false);
    }
  }

  if (state === "loading") {
    return (
      <span className="text-sm text-muted">{t("friends.loadingStatus")}</span>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {state === "friend" ? (
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="secondary" disabled>
            {t("friends.areFriends")}
          </Button>
          <Button onClick={handleMessage} disabled={actionLoading}>
            {actionLoading ? t("chat.sending") : t("friends.sendMessage")}
          </Button>
        </div>
      ) : state === "outgoing" ? (
        <Button variant="secondary" disabled>
          {t("friends.requestSentLabel")}
        </Button>
      ) : state === "incoming" ? (
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAccept} disabled={actionLoading}>
            {actionLoading ? t("chat.sending") : t("friends.accept")}
          </Button>
          <Button
            variant="secondary"
            onClick={handleReject}
            disabled={actionLoading}
          >
            {t("friends.reject")}
          </Button>
        </div>
      ) : (
        <Button onClick={handleSendRequest} disabled={actionLoading}>
          {actionLoading ? t("friends.sending") : t("friends.addFriend")}
        </Button>
      )}

      {state === "none" && getToken() ? (
        <p className="text-xs text-muted">{t("friends.mustBeFriend")}</p>
      ) : null}

      {message ? <p className="text-xs text-emerald-300">{message}</p> : null}
      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
