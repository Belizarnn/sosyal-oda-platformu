"use client";

import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";

export function PwaInstallCard() {
  const { t } = useLanguage();

  return (
    <Card className="border-accent/20 bg-accent/5 p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {t("pwa.install.title")}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {t("pwa.install.description")}
          </p>
        </div>
        <span
          aria-hidden
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-lg"
        >
          ⬇
        </span>
      </div>
      <p className="mt-3 text-xs text-muted">{t("pwa.install.hint")}</p>
    </Card>
  );
}
