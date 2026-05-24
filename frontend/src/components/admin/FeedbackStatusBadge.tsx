"use client";

import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeedbackStatusLabel } from "@/i18n/utils";
import type { FeedbackStatus } from "@/types/feedback";
import { cn } from "@/lib/cn";

const statusStyles: Record<FeedbackStatus, string> = {
  OPEN: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  REVIEWED: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  PLANNED: "border-violet-500/30 bg-violet-500/10 text-violet-200",
  RESOLVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-200",
};

interface FeedbackStatusBadgeProps {
  status: FeedbackStatus;
  className?: string;
}

export function FeedbackStatusBadge({ status, className }: FeedbackStatusBadgeProps) {
  const { t } = useLanguage();

  return (
    <Badge className={cn(statusStyles[status], className)}>
      {getFeedbackStatusLabel(status, t)}
    </Badge>
  );
}
