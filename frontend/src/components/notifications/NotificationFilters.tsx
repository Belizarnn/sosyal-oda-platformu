"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import type { NotificationFilterId } from "@/types/notification";

const FILTER_ITEMS: { id: NotificationFilterId; labelKey: string }[] = [
  { id: "all", labelKey: "notifications.filters.all" },
  { id: "unread", labelKey: "notifications.filters.unread" },
  { id: "friends", labelKey: "notifications.filters.friends" },
  { id: "messages", labelKey: "notifications.filters.messages" },
  { id: "rooms", labelKey: "notifications.filters.rooms" },
  { id: "system", labelKey: "notifications.filters.system" },
];

interface NotificationFiltersProps {
  activeFilter: NotificationFilterId;
  unreadCount: number;
  onFilterChange: (filter: NotificationFilterId) => void;
}

export function NotificationFilters({
  activeFilter,
  unreadCount,
  onFilterChange,
}: NotificationFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface/50 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTER_ITEMS.map((filter) => {
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange(filter.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
              isActive
                ? "bg-accent/15 text-foreground"
                : "text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {t(filter.labelKey)}
            {filter.id === "unread" && unreadCount > 0 ? (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs">
                {unreadCount}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
