"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicConfig } from "@/hooks/usePublicConfig";
import { cn } from "@/lib/cn";

interface BetaBannerProps {
  className?: string;
}

export function BetaBanner({ className }: BetaBannerProps) {
  const { t } = useLanguage();
  const { config } = usePublicConfig();

  if (!config.betaMode) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-center text-sm text-foreground",
        className,
      )}
      role="status"
    >
      {t("beta.banner")}
    </div>
  );
}
