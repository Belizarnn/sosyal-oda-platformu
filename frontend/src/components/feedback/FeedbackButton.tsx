"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import { FeedbackModal } from "./FeedbackModal";

interface FeedbackButtonProps {
  variant?: "floating" | "inline" | "landing";
  className?: string;
}

export function FeedbackButton({
  variant = "floating",
  className,
}: FeedbackButtonProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          variant === "floating" &&
            "fixed right-4 z-40 rounded-full border border-border bg-dropdown px-3 py-2 text-xs font-medium text-foreground shadow-[0_8px_24px_var(--shadow)] transition hover:bg-surface-hover sm:text-sm",
          variant === "floating" &&
            "bottom-[calc(var(--mobile-nav-height)+env(safe-area-inset-bottom,0px)+1rem)] lg:bottom-6",
          variant === "inline" &&
            "inline-flex items-center justify-center rounded-xl border border-border bg-surface px-4 py-2.5 text-sm transition hover:bg-surface-hover",
          variant === "landing" &&
            "fixed right-4 z-30 rounded-full border border-white/15 bg-slate-900/70 px-3 py-2 text-xs font-medium text-white backdrop-blur-md transition hover:bg-slate-800/80 sm:text-sm",
          variant === "landing" && "bottom-6",
          className,
        )}
        aria-label={t("feedback.buttonAria")}
      >
        {t("feedback.button")}
      </button>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
