"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import type { SettingsSection } from "@/types/settings";

const SECTIONS: { id: SettingsSection; labelKey: string; icon: string }[] = [
  { id: "account", labelKey: "settings.sections.account", icon: "◉" },
  { id: "profile", labelKey: "settings.sections.profile", icon: "✎" },
  { id: "premium", labelKey: "settings.sections.premium", icon: "✦" },
  { id: "notifications", labelKey: "settings.sections.notifications", icon: "◔" },
  { id: "audioVideo", labelKey: "settings.sections.audioVideo", icon: "🎙" },
  { id: "security", labelKey: "settings.sections.security", icon: "⛨" },
  { id: "language", labelKey: "settings.sections.language", icon: "🌐" },
  { id: "danger", labelKey: "settings.sections.danger", icon: "⚠" },
];

interface SettingsLayoutProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  children: React.ReactNode;
}

export function SettingsLayout({
  activeSection,
  onSectionChange,
  children,
}: SettingsLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row lg:gap-8">
      <nav className="flex shrink-0 gap-2 overflow-x-auto pb-1 lg:w-56 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSectionChange(section.id)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition",
                isActive
                  ? "bg-accent/15 text-foreground shadow-[inset_0_0_20px_var(--glow)]"
                  : "text-muted hover:bg-surface hover:text-foreground",
                section.id === "danger" && !isActive && "text-red-300/70 hover:text-red-300",
                section.id === "danger" &&
                  isActive &&
                  "bg-red-500/10 text-red-200 shadow-[inset_0_0_20px_rgba(239,68,68,0.08)]",
              )}
            >
              <span className="text-base">{section.icon}</span>
              {t(section.labelKey)}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
