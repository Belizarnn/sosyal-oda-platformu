"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface SidebarToggleButtonProps {
  onClick: () => void;
  visible: boolean;
}

export function SidebarToggleButton({ onClick, visible }: SidebarToggleButtonProps) {
  const { t } = useLanguage();

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("nav.openMenu")}
      className={cn(
        "fixed z-30 hidden items-center justify-center lg:flex",
        "left-0 top-1/2 -translate-y-1/2",
        "h-12 w-10 rounded-r-xl border border-l-0 border-border",
        "bg-sidebar/95 text-muted shadow-[4px_0_24px_var(--shadow)] backdrop-blur-xl",
        "transition hover:w-11 hover:bg-surface-hover hover:text-foreground",
      )}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
}
