"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";

const ACTION_CARDS = [
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
    href: "/rooms?action=create",
    icon: "＋",
  },
  {
    titleKey: "dashboard.actions.findFriends.title",
    descriptionKey: "dashboard.actions.findFriends.description",
    buttonKey: "dashboard.actions.findFriends.button",
    href: "/friends",
    icon: "♡",
  },
  {
    titleKey: "dashboard.actions.messages.title",
    descriptionKey: "dashboard.actions.messages.description",
    buttonKey: "dashboard.actions.messages.button",
    href: "/messages",
    icon: "✉",
  },
] as const;

export function DashboardActionCards() {
  const { t } = useLanguage();

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ACTION_CARDS.map((card) => (
        <Card
          key={card.titleKey}
          className="flex flex-col justify-between gap-5 p-5 transition hover:border-accent/25"
        >
          <div>
            <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-base text-accent">
              {card.icon}
            </span>
            <h2 className="text-base font-semibold">{t(card.titleKey)}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t(card.descriptionKey)}</p>
          </div>
          <Button href={card.href} size="sm" className="w-fit">
            {t(card.buttonKey)}
          </Button>
        </Card>
      ))}
    </section>
  );
}
