"use client";

import { useCallback, useEffect, useState } from "react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { SocialConnectionPanel } from "@/components/friends/SocialConnectionPanel";
import { InterestTag } from "@/components/profile/InterestTag";
import { ProfileBadgeList } from "@/components/profile/ProfileBadgeList";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { RecentActivityList } from "@/components/profile/RecentActivityList";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSpinner } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, getUserProfile, type AuthUser } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfile } from "@/types/user";

interface ProfileViewProps {
  handle: string;
}

export function ProfileView({ handle }: ProfileViewProps) {
  const { user: currentUser, setUser } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await getUserProfile(handle);
      setProfile(response.profile);
    } catch (err) {
      setProfile(null);
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
        setError(t("profile.userNotFound"));
      } else {
        setError(
          err instanceof ApiError ? err.message : t("states.error.loadFailed"),
        );
      }
    } finally {
      setLoading(false);
    }
  }, [handle, t]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  function handleProfileSaved(user: AuthUser, updatedProfile: UserProfile) {
    setProfile(updatedProfile);
    setUser(user);
  }

  if (loading) {
    return <LoadingSpinner label={t("states.loading.profile")} className="mx-auto max-w-4xl" />;
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-4xl">
        <ErrorState
          title={notFound ? t("states.error.profileNotFound") : t("states.error.loadFailed")}
          description={error ?? t("profile.unreachable")}
          onRetry={() => void loadProfile()}
        />
      </div>
    );
  }

  const isOwnProfile = currentUser?.handle === profile.handle;

  return (
    <>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <ProfileHeader
          user={profile}
          isOwnProfile={isOwnProfile}
          onEditClick={() => setEditOpen(true)}
          onAvatarUpdated={(nextAvatarUrl) => {
            setProfile((current) =>
              current ? { ...current, avatarUrl: nextAvatarUrl } : current,
            );
            if (currentUser) {
              setUser({ ...currentUser, avatarUrl: nextAvatarUrl });
            }
          }}
        />

        {!isOwnProfile && currentUser ? (
          <SocialConnectionPanel
            profileUserId={profile.id}
            profileHandle={profile.handle}
          />
        ) : null}

        <Card>
          <h2 className="mb-3 text-sm font-semibold">{t("profile.interestsTitle")}</h2>
          {profile.profileInterests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.profileInterests.map((interest) => (
                <InterestTag key={interest} label={interest} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">{t("profile.noInterests")}</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold">{t("profile.badgesTitle")}</h2>
          <ProfileBadgeList />
          <p className="mt-2 text-xs text-muted">
            {t("profile.badgesComingSoon")}
          </p>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold">{t("profile.recentActivity")}</h2>
          <RecentActivityList activity={profile.activity} username={profile.username} />
        </Card>
      </div>

      {isOwnProfile ? (
        <EditProfileModal
          open={editOpen}
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={handleProfileSaved}
        />
      ) : null}
    </>
  );
}
