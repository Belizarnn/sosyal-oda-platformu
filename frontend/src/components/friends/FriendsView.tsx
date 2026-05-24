"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FriendActivityCard } from "@/components/friends/FriendActivityCard";
import { FriendsTabs, type FriendsTabId } from "@/components/friends/FriendsTabs";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getFriendsActivity,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
  startDirectConversation,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Friend, FriendActivityItem, FriendRequest } from "@/types/friend";

export function FriendsView() {
  const router = useRouter();
  const { t } = useLanguage();
  const { success: showSuccessToast } = useToast();
  const { user, loading: authLoading, isReady } = useRequireAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [activityFriends, setActivityFriends] = useState<FriendActivityItem[]>([]);
  const [incoming, setIncoming] = useState<FriendRequest[]>([]);
  const [outgoing, setOutgoing] = useState<FriendRequest[]>([]);
  const [activeTab, setActiveTab] = useState<FriendsTabId>("friends");
  const [handleInput, setHandleInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activityById = useMemo(
    () => new Map(activityFriends.map((friend) => [friend.id, friend])),
    [activityFriends],
  );

  const activeFriends = useMemo(
    () =>
      activityFriends.filter(
        (friend) => friend.currentRoom || friend.presenceStatus !== "OFFLINE",
      ),
    [activityFriends],
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [friendsResponse, incomingResponse, outgoingResponse, activityResponse] =
        await Promise.all([
          getFriends(),
          getIncomingFriendRequests(),
          getOutgoingFriendRequests(),
          getFriendsActivity(),
        ]);

      setFriends(friendsResponse.friends);
      setIncoming(incomingResponse.requests);
      setOutgoing(outgoingResponse.requests);
      setActivityFriends(activityResponse.friends);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("friends.dataLoadFailed"),
      );
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void loadAll();
  }, [loadAll, isReady]);

  async function handleSendRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionLoading("send");
    setError(null);
    trackEvent("friend_request_clicked");

    try {
      const result = await sendFriendRequest(handleInput.trim());
      setHandleInput("");
      showSuccessToast(
        result.autoAccepted
          ? t("friends.mutualAccepted")
          : t("friends.requestSent"),
      );
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.sendFailed"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAccept(requestId: string) {
    setActionLoading(requestId);
    setError(null);

    try {
      await acceptFriendRequest(requestId);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.acceptFailed"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(requestId: string) {
    setActionLoading(requestId);
    setError(null);

    try {
      await rejectFriendRequest(requestId);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.rejectFailed"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCancel(requestId: string) {
    setActionLoading(requestId);
    setError(null);

    try {
      await cancelFriendRequest(requestId);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.cancelFailed"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRemoveFriend(userId: string) {
    setActionLoading(userId);
    setError(null);

    try {
      await removeFriend(userId);
      await loadAll();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("friends.removeFailed"));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleStartMessage(userId: string) {
    setActionLoading(userId);
    setError(null);

    try {
      const { conversation } = await startDirectConversation({ userId });
      router.push(`/messages/${conversation.id}`);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("friends.startChatFailed"),
      );
    } finally {
      setActionLoading(null);
    }
  }

  if (authLoading || loading) {
    return (
      <LoadingState
        label={t("states.loading.friends")}
        rows={2}
        className="mx-auto max-w-4xl"
      />
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("friends.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("friends.subtitle")}</p>
      </div>

      <div id="add-friend">
        <Card glow>
          <h2 className="mb-4 text-sm font-semibold">{t("friends.addFriend")}</h2>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSendRequest}>
            <Input
              label={t("friends.userHandle")}
              prefix="@"
              value={handleInput}
              onChange={(event) =>
                setHandleInput(event.target.value.replace(/^@+/, "").toLowerCase())
              }
              placeholder={t("friends.handlePlaceholder")}
              required
            />
            <Button
              type="submit"
              className="sm:self-end"
              disabled={actionLoading === "send"}
            >
              {actionLoading === "send" ? t("friends.sending") : t("friends.addFriend")}
            </Button>
          </form>
          {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        </Card>
      </div>

      <FriendsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          friends: friends.length,
          active: activeFriends.length,
          incoming: incoming.length,
          outgoing: outgoing.length,
        }}
      />

      {activeTab === "friends" ? (
        friends.length === 0 ? (
          <EmptyState
            icon="♡"
            title={t("states.empty.noFriends")}
            description={t("friends.emptyFriendsHint")}
            actionLabel={t("friends.addFriend")}
            href="/friends#add-friend"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {friends.map((friend) => (
              <FriendActivityCard
                key={friend.id}
                friend={
                  activityById.get(friend.id) ?? {
                    ...friend,
                    currentRoom: null,
                    isRoomMember: false,
                  }
                }
                actionLoading={actionLoading === friend.id}
                onMessage={(userId) => void handleStartMessage(userId)}
                onRemove={(userId) => void handleRemoveFriend(userId)}
                showRemove
              />
            ))}
          </div>
        )
      ) : null}

      {activeTab === "active" ? (
        activeFriends.length === 0 ? (
          <EmptyState
            icon="◎"
            title={t("friends.noActiveFriends")}
            description={t("friends.noActiveFriendsDesc")}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {activeFriends.map((friend) => (
              <FriendActivityCard
                key={friend.id}
                friend={friend}
                actionLoading={actionLoading === friend.id}
                onMessage={(userId) => void handleStartMessage(userId)}
              />
            ))}
          </div>
        )
      ) : null}

      {activeTab === "incoming" ? (
        incoming.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">{t("friends.noIncomingRequests")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {incoming.map((request) => {
              const sender = request.sender;
              if (!sender) {
                return null;
              }

              return (
                <Card key={request.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={sender.username} src={sender.avatarUrl} size="md" />
                    <div>
                      <p className="font-medium">{sender.username}</p>
                      <p className="text-sm text-muted">@{sender.handle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {t("friends.accept")}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleReject(request.id)}
                      disabled={actionLoading === request.id}
                    >
                      {t("friends.reject")}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : null}

      {activeTab === "outgoing" ? (
        outgoing.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">{t("friends.noOutgoingRequests")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {outgoing.map((request) => {
              const receiver = request.receiver;
              if (!receiver) {
                return null;
              }

              return (
                <Card key={request.id} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar name={receiver.username} src={receiver.avatarUrl} size="md" />
                    <div>
                      <p className="font-medium">{receiver.username}</p>
                      <p className="text-sm text-muted">@{receiver.handle}</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleCancel(request.id)}
                    disabled={actionLoading === request.id}
                  >
                    {t("friends.cancelRequest")}
                  </Button>
                </Card>
              );
            })}
          </div>
        )
      ) : null}
    </div>
  );
}
