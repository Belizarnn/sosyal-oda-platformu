"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface ErrorStateProps {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title,
  description,
  retryLabel,
  onRetry,
  className,
}: ErrorStateProps) {
  const { t } = useLanguage();

  return (
    <Card
      className={cn(
        "border-error/20 bg-error/10 px-6 py-8 text-center",
        className,
      )}
    >
      <h3 className="text-lg font-semibold text-error">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-error/90">{description}</p>
      {onRetry ? (
        <Button variant="secondary" className="mt-5" onClick={onRetry}>
          {retryLabel ?? t("common.retry")}
        </Button>
      ) : null}
    </Card>
  );
}
