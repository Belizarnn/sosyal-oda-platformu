"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";

export function PremiumCancelPageContent() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 py-10">
      <Card className="space-y-4 p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-amber-300">
          {t("premium.cancel.eyebrow")}
        </p>
        <h1 className="text-2xl font-semibold">{t("premium.cancel.title")}</h1>
        <p className="text-sm leading-relaxed text-muted">
          {t("premium.cancel.description")}
        </p>
        <div className="pt-2">
          <Button href="/premium">{t("premium.cancel.backToPremium")}</Button>
        </div>
      </Card>
    </div>
  );
}
