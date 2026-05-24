"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

export type FriendsTabId = "friends" | "active" | "incoming" | "outgoing";

const TAB_ITEMS: { id: FriendsTabId; labelKey: string }[] = [
  { id: "friends", labelKey: "friends.tabs.friends" },
  { id: "active", labelKey: "friends.tabs.active" },
  { id: "incoming", labelKey: "friends.tabs.incoming" },
  { id: "outgoing", labelKey: "friends.tabs.outgoing" },
];

interface FriendsTabsProps {
  activeTab: FriendsTabId;
  counts: Partial<Record<FriendsTabId, number>>;
  onTabChange: (tab: FriendsTabId) => void;
}

export function FriendsTabs({ activeTab, counts, onTabChange }: FriendsTabsProps) {
  const { t } = useLanguage();

  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface/50 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      {TAB_ITEMS.map((tab) => {
        const count = counts[tab.id];
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-accent/15 text-foreground shadow-[inset_0_0_20px_var(--accent-soft)]"
                : "text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {t(tab.labelKey)}
            {typeof count === "number" && count > 0 ? (
              <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-muted">
                {count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
