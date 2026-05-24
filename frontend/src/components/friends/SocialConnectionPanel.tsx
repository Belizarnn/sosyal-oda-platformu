"use client";

import { useEffect, useState } from "react";
import { FriendActionButton } from "@/components/friends/FriendActionButton";
import { MutualFriends } from "@/components/friends/MutualFriends";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, getUserSocialInfo } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { UserSocialInfo } from "@/types/friend";

interface SocialConnectionPanelProps {
  profileHandle: string;
  profileUserId: string;
}

export function SocialConnectionPanel({
  profileHandle,
  profileUserId,
}: SocialConnectionPanelProps) {
  const { t } = useLanguage();
  const [social, setSocial] = useState<UserSocialInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSocial() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getUserSocialInfo(profileHandle);
        setSocial(response);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("friends.socialLoadFailed"));
      } finally {
        setLoading(false);
      }
    }

    void loadSocial();
  }, [profileHandle, t]);

  function getStatusLabel(info: UserSocialInfo) {
    switch (info.friendshipStatus) {
      case "FRIENDS":
        return t("friends.areFriends");
      case "PENDING_SENT":
        return t("friends.requestSentLabel");
      case "PENDING_RECEIVED":
        return t("friends.incomingRequestLabel");
      default:
        return t("friends.notFriendsYet");
    }
  }

  return (
    <Card glow className="space-y-4 p-5">
      <div>
        <h2 className="text-sm font-semibold">{t("friends.socialConnectionTitle")}</h2>
        <p className="mt-1 text-xs text-muted">{t("friends.socialConnectionSubtitle")}</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted">{t("friends.loadingStatus")}</p>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      {social ? (
        <>
          <div className="rounded-xl border border-border/60 bg-surface/40 px-3 py-2.5">
            <p className="text-xs text-muted">{t("friends.friendshipStatus")}</p>
            <p className="mt-1 text-sm font-medium">{getStatusLabel(social)}</p>
          </div>

          <MutualFriends count={social.mutualFriendsCount} friends={social.mutualFriends} />

          <FriendActionButton
            profileUserId={profileUserId}
            profileHandle={profileHandle}
          />
        </>
      ) : null}
    </Card>
  );
}
