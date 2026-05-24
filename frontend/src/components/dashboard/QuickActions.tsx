"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

export function QuickActions() {
  const { t } = useLanguage();

  const actions = [
    { labelKey: "dashboard.quickActions.createRoom", href: "/rooms?create=1", icon: "＋" },
    { labelKey: "dashboard.quickActions.joinRooms", href: "/rooms", icon: "◎" },
    { labelKey: "dashboard.quickActions.addFriend", href: "/friends", icon: "♡" },
    { labelKey: "dashboard.quickActions.messages", href: "/messages", icon: "✉" },
  ] as const;

  return (
    <section aria-label={t("dashboard.quickActions.label")}>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.labelKey}
            variant="secondary"
            href={action.href}
            size="sm"
            className="gap-2"
          >
            <span aria-hidden>{action.icon}</span>
            {t(action.labelKey)}
          </Button>
        ))}
      </div>
    </section>
  );
}
