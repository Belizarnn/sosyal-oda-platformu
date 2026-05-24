"use client";

import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { getReportStatusLabel } from "@/i18n/utils";
import type { ReportStatus } from "@/types/admin";
import { cn } from "@/lib/cn";

const statusStyles: Record<ReportStatus, string> = {
  OPEN: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  REVIEWED: "border-sky-500/30 bg-sky-500/10 text-sky-200",
  RESOLVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-200",
};

interface ReportStatusBadgeProps {
  status: ReportStatus;
  className?: string;
}

export function ReportStatusBadge({ status, className }: ReportStatusBadgeProps) {
  const { t } = useLanguage();

  return (
    <Badge className={cn(statusStyles[status], className)}>
      {getReportStatusLabel(status, t)}
    </Badge>
  );
}
