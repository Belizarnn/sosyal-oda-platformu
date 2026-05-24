"use client";

import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { DashboardQuickStats } from "@/types/dashboard";

interface DashboardStatsProps {
  stats: DashboardQuickStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const { t } = useLanguage();

  const items = [
    {
      label: t("dashboard.stats.roomsJoined"),
      value: stats.roomsJoined,
    },
    {
      label: t("dashboard.stats.friendsCount"),
      value: stats.friendsCount,
    },
    {
      label: t("dashboard.stats.unreadNotifications"),
      value: stats.unreadNotifications,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="p-4 text-center">
          <p className="text-2xl font-semibold text-accent">{item.value}</p>
          <p className="mt-1 text-xs text-muted">{item.label}</p>
        </Card>
      ))}
    </section>
  );
}
