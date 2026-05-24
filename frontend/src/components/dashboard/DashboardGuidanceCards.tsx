"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";

const MAIN_ACTION_KEYS = [
  {
    titleKey: "dashboard.actions.joinRoom.title",
    descriptionKey: "dashboard.actions.joinRoom.description",
    buttonKey: "dashboard.actions.joinRoom.button",
    href: "/rooms",
    icon: "◎",
  },
  {
    titleKey: "dashboard.actions.createRoom.title",
    descriptionKey: "dashboard.actions.createRoom.description",
    buttonKey: "dashboard.actions.createRoom.button",
    href: "/rooms?create=1",
    icon: "＋",
  },
  {
    titleKey: "dashboard.actions.findFriends.title",
    descriptionKey: "dashboard.actions.findFriends.description",
    buttonKey: "dashboard.actions.findFriends.button",
    href: "/friends",
    icon: "♡",
  },
] as const;

export function DashboardGuidanceCards() {
  const { t } = useLanguage();

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MAIN_ACTION_KEYS.map((card) => (
        <Card
          key={card.titleKey}
          glow
          className="flex flex-col justify-between gap-5 p-6 transition hover:border-accent/25"
        >
          <div>
            <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-lg text-accent">
              {card.icon}
            </span>
            <h2 className="text-lg font-semibold">{t(card.titleKey)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t(card.descriptionKey)}</p>
          </div>
          <Button href={card.href} className="w-fit">
            {t(card.buttonKey)}
          </Button>
        </Card>
      ))}
    </section>
  );
}
