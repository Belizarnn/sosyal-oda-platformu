"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardQuickActions } from "@/components/dashboard/DashboardQuickActions";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { EnterInviteCodeModal } from "@/components/dashboard/EnterInviteCodeModal";
import { FriendsInRooms } from "@/components/dashboard/FriendsInRooms";
import { RecentNotificationsCard } from "@/components/dashboard/RecentNotificationsCard";
import { RecommendedRooms } from "@/components/dashboard/RecommendedRooms";
import { CreateRoomModal } from "@/components/rooms/CreateRoomModal";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import {
  ApiError,
  getDashboard,
  getFriendsActivity,
  startDirectConversation,
  type AuthUser,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type { DashboardResponse } from "@/types/dashboard";
import type { FriendActivityItem } from "@/types/friend";
import { ContinueRoomCard } from "@/components/dashboard/ContinueRoomCard";

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-5xl animate-pulse flex-col gap-6">
      <div className="h-8 w-48 rounded-lg bg-surface" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-12 rounded-xl bg-surface" />
        ))}
      </div>
      <div className="h-24 rounded-xl bg-surface" />
    </div>
  );
}

export function DashboardView() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();
  const { t } = useLanguage();
  const [localUser, setLocalUser] = useState<AuthUser | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [friendsActivity, setFriendsActivity] = useState<FriendActivityItem[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function loadDashboard() {
      if (!user) {
        setDashboard(null);
        setDashboardLoading(false);
        return;
      }

      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const [response, activityResponse] = await Promise.all([
          getDashboard(),
          getFriendsActivity(),
        ]);
        setDashboard(response);
        setFriendsActivity(activityResponse.friends);
        trackEvent("dashboard_opened");
      } catch (err) {
        setDashboardError(
          err instanceof ApiError ? err.message : t("states.error.loadFailed"),
        );
      } finally {
        setDashboardLoading(false);
      }
    }

    void loadDashboard();
  }, [user, t]);

  function handleUserUpdated(updatedUser: AuthUser) {
    setLocalUser(updatedUser);
    setUser(updatedUser);
  }

  async function handleFriendMessage(userId: string) {
    try {
      const { conversation } = await startDirectConversation({ userId });
      router.push(`/messages/${conversation.id}`);
    } catch {
      router.push("/friends");
    }
  }

  if (loading || !localUser) {
    return loading ? <DashboardSkeleton /> : null;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">
          {t("dashboard.welcome", { name: localUser.username })}
        </h1>
        <p className="text-sm text-muted">{t("dashboard.subtitle")}</p>
      </header>

      <EmailVerificationBanner user={localUser} onUserUpdated={handleUserUpdated} />

      <DashboardSection title={t("dashboard.quickActions.label")}>
        <DashboardQuickActions
          continueRoom={dashboard?.continueRoom ?? null}
          onCreateRoom={() => setCreateOpen(true)}
          onEnterInviteCode={() => setInviteOpen(true)}
        />
      </DashboardSection>

      {dashboardError ? (
        <ErrorState
          title={t("states.error.loadFailed")}
          description={dashboardError}
          onRetry={() => window.location.reload()}
        />
      ) : null}

      {dashboardLoading ? (
        <LoadingState label={t("states.loading.dashboard")} rows={2} />
      ) : dashboard ? (
        <>
          <ContinueRoomCard room={dashboard.continueRoom} />

          <FriendsInRooms
            friends={friendsActivity}
            onMessage={(userId) => void handleFriendMessage(userId)}
          />

          <RecommendedRooms rooms={dashboard.recommendedRooms} variant="active" />

          <RecentNotificationsCard notifications={dashboard.recentNotifications} />
        </>
      ) : null}

      <CreateRoomModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(room) => {
          setCreateOpen(false);
          router.push(`/rooms/${room.id}`);
        }}
      />

      <EnterInviteCodeModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}
