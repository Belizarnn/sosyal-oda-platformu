"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { PresenceDot } from "@/components/presence/PresenceDot";
import { Input } from "@/components/ui/Input";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { getPresenceLabel, getPresenceMeta } from "@/lib/presence";
import { cn } from "@/lib/cn";
import { isAdminPanelRole } from "@/types/admin";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-topbar px-4 backdrop-blur-xl sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-border bg-surface p-2.5 text-muted transition hover:bg-surface-hover hover:text-foreground lg:hidden"
        aria-label={t("nav.openMenu")}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      <div className="hidden min-w-0 flex-1 sm:block">
        <Input
          placeholder={t("common.searchPlaceholder")}
          aria-label={t("common.searchAria")}
          className="max-w-md"
        />
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <NotificationBell />

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-2xl border border-border bg-surface py-1.5 pl-1.5 pr-3 transition hover:bg-surface-hover"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
            >
              <div className="relative">
                <Avatar name={user.username} src={user.avatarUrl} size="sm" />
                <span className="absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-ring-offset">
                  <PresenceDot status={user.presenceStatus} className="h-2 w-2" />
                </span>
              </div>
              <div className="hidden min-w-0 sm:block text-left">
                <p className="truncate text-sm font-medium leading-tight">
                  {user.username}
                </p>
                <p className="truncate text-xs text-muted">
                  @{user.handle} · {getPresenceLabel(user.presenceStatus, t)}
                </p>
              </div>
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-44 overflow-hidden rounded-xl border border-border bg-dropdown py-1 shadow-[0_8px_32px_var(--shadow)]"
              >
                <Link
                  href={`/profile/${user.handle}`}
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-foreground transition hover:bg-surface-hover"
                >
                  {t("nav.myProfile")}
                </Link>
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm text-foreground transition hover:bg-surface-hover"
                >
                  {t("nav.settings")}
                </Link>
                {isAdminPanelRole(user.role) ? (
                  <Link
                    href="/admin"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-foreground transition hover:bg-surface-hover"
                  >
                    {t("nav.admin")}
                  </Link>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className={cn(
                    "block w-full px-4 py-2.5 text-left text-sm text-error transition hover:bg-error/10",
                  )}
                >
                  {t("nav.logout")}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full ring-2 ring-border transition hover:ring-accent/40"
            aria-label={t("nav.login")}
          >
            <Avatar name={t("common.guest")} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}
