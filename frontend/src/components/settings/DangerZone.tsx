"use client";

import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";

export function DangerZone() {
  const { t } = useLanguage();

  return (
    <Card className="border-red-500/20 bg-red-500/[0.03] space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-red-200">{t("settings.danger.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("settings.danger.subtitle")}</p>
      </div>

      <div className="rounded-xl border border-red-500/20 bg-black/20 p-4">
        <p className="text-sm text-red-100/80">{t("settings.danger.warning")}</p>
      </div>
    </Card>
  );
}
