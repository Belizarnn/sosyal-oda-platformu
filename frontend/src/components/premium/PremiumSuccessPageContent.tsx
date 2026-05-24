"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";

export function PremiumSuccessPageContent() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-10">
      <Card className="space-y-4 p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
          {t("premium.success.eyebrow")}
        </p>
        <h1 className="text-2xl font-semibold">{t("premium.success.title")}</h1>
        <p className="text-sm leading-relaxed text-muted">
          {t("premium.success.description")}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button href="/dashboard">{t("premium.success.dashboard")}</Button>
          <Button href="/premium" variant="secondary">
            {t("premium.success.backToPremium")}
          </Button>
        </div>
      </Card>
      <p className="text-center text-sm text-muted">
        {t("premium.success.settingsHint")}{" "}
        <Link href="/settings" className="text-violet-300 hover:underline">
          {t("premium.settings.title")}
        </Link>
      </p>
    </div>
  );
}
