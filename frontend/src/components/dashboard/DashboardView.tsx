"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContinueRoomCard } from "@/components/dashboard/ContinueRoomCard";
import { DashboardActionCards } from "@/components/dashboard/DashboardActionCards";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { FriendsInRooms } from "@/components/dashboard/FriendsInRooms";
import { PresenceCard } from "@/components/dashboard/PresenceCard";
import { RecentNotificationsCard } from "@/components/dashboard/RecentNotificationsCard";
import { RecommendedRooms } from "@/components/dashboard/RecommendedRooms";
import { EmailVerificationBanner } from "@/components/auth/EmailVerificationBanner";
import { PwaInstallCard } from "@/components/pwa/PwaInstallCard";
import { SmartDashboardHero } from "@/components/dashboard/SmartDashboardHero";
import { PresenceSelector } from "@/components/presence/PresenceSelector";
import { StatusMessageEditor } from "@/components/presence/StatusMessageEditor";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, getDashboard, getFriendsActivity, startDirectConversation, type AuthUser } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import type { DashboardResponse } from "@/types/dashboard";
import type { FriendActivityItem } from "@/types/friend";

function DashboardSkeleton() {
  return (
    <div className="mx-auto flex max-w-6xl animate-pulse flex-col gap-8">
      <div className="h-36 rounded-2xl bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-40 rounded-2xl bg-surface" />
        ))}
      </div>
      <div className="h-28 rounded-2xl bg-surface" />
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
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <SmartDashboardHero user={localUser} />

      <EmailVerificationBanner
        user={localUser}
        onUserUpdated={handleUserUpdated}
      />

      <PwaInstallCard />

      <DashboardActionCards />

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
          <DashboardStats stats={dashboard.quickStats} />
          <ContinueRoomCard room={dashboard.continueRoom} />
          <RecommendedRooms rooms={dashboard.recommendedRooms} />
          <FriendsInRooms
            friends={friendsActivity}
            onMessage={(userId) => void handleFriendMessage(userId)}
          />

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{t("dashboard.onlineFriends")}</h2>
              <Button variant="ghost" href="/friends" size="sm">
                {t("dashboard.actions.findFriends.button")}
              </Button>
            </div>
            {dashboard.onlineFriends.length === 0 ? (
              <EmptyState
                icon="♡"
                title={t("states.empty.noFriendsOnline")}
                description={t("states.empty.noFriendsOnlineDesc")}
                actionLabel={t("dashboard.actions.findFriends.button")}
                href="/friends"
                className="py-8"
              />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {dashboard.onlineFriends.map((friend) => (
                  <PresenceCard key={friend.id} friend={friend} />
                ))}
              </div>
            )}
          </section>

          <RecentNotificationsCard notifications={dashboard.recentNotifications} />
        </>
      ) : null}

      <Card className="space-y-4 border-border/80 bg-surface/40 p-5">
        <h2 className="text-sm font-semibold text-muted">{t("dashboard.updatePresence")}</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <PresenceSelector user={localUser} onUpdated={handleUserUpdated} />
          <StatusMessageEditor user={localUser} onUpdated={handleUserUpdated} />
        </div>
      </Card>
    </div>
  );
}
