"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";
import { isAdminPanelRole } from "@/types/admin";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

type NavItem = {
  href: string;
  labelKey: string;
  isActive?: (pathname: string) => boolean;
};

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const profileHref = user ? `/profile/${user.handle}` : "/login";
  const showAdminLink = isAdminPanelRole(user?.role);

  const navItems: NavItem[] = [
    { href: "/dashboard", labelKey: "nav.home" },
    { href: "/rooms", labelKey: "nav.rooms" },
    { href: "/messages", labelKey: "nav.messages" },
    {
      href: "/notifications",
      labelKey: "nav.notifications",
      isActive: (path) => path.startsWith("/notifications"),
    },
    {
      href: "/settings",
      labelKey: "nav.settings",
      isActive: (path) => path.startsWith("/settings"),
    },
    {
      href: profileHref,
      labelKey: "nav.profile",
      isActive: (path) => path.startsWith("/profile"),
    },
    ...(showAdminLink
      ? [
          {
            href: "/admin",
            labelKey: "nav.admin",
            isActive: (path: string) => path.startsWith("/admin"),
          },
        ]
      : []),
  ];

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[var(--overlay)] backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-border bg-sidebar transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <Link href="/" className="block min-w-0 flex-1" onClick={onClose}>
            <p className="text-lg font-semibold text-foreground">{t("common.brandName")}</p>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="ml-2 inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition hover:bg-surface-hover hover:text-foreground"
            aria-label={t("nav.closeMenu")}
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive = item.isActive?.(pathname) ?? pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm transition",
                  isActive
                    ? "bg-accent-soft font-medium text-foreground"
                    : "text-muted hover:bg-surface-hover hover:text-foreground",
                )}
              >
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4">
          {user ? (
            <div className="flex items-center gap-3 rounded-lg bg-surface p-3">
              <Avatar name={user.username} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.username}</p>
                <p className="truncate text-xs text-muted">@{user.handle}</p>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="block rounded-lg border border-border bg-surface p-3 text-center text-sm text-muted transition hover:bg-surface-hover hover:text-foreground"
            >
              {t("nav.login")}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
