"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

export type RoomTabId = "chat" | "voice" | "watch" | "members" | "info";

const TAB_KEYS: { id: RoomTabId; labelKey: string; icon: string }[] = [
  { id: "chat", labelKey: "rooms.tabs.chat", icon: "💬" },
  { id: "voice", labelKey: "rooms.tabs.voice", icon: "🎙" },
  { id: "watch", labelKey: "rooms.tabs.watch", icon: "▶" },
  { id: "members", labelKey: "rooms.tabs.members", icon: "👥" },
  { id: "info", labelKey: "rooms.tabs.info", icon: "ℹ" },
];

interface RoomTabsProps {
  activeTab: RoomTabId;
  onTabChange: (tab: RoomTabId) => void;
}

export function RoomTabs({ activeTab, onTabChange }: RoomTabsProps) {
  const { t } = useLanguage();

  return (
    <div
      className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface/50 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      {TAB_KEYS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition sm:px-4",
              isActive
                ? "bg-accent/15 text-foreground shadow-[inset_0_0_20px_var(--accent-soft)]"
                : "text-muted hover:bg-surface-hover hover:text-foreground",
            )}
          >
            <span aria-hidden>{tab.icon}</span>
            {t(tab.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
