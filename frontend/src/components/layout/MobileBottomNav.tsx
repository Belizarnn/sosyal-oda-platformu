"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

type MobileNavItem = {
  href: string;
  labelKey: string;
  icon: string;
  isActive: (pathname: string) => boolean;
};

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const profileHref = user ? `/profile/${user.handle}` : "/login";

  const navItems: MobileNavItem[] = [
    {
      href: "/dashboard",
      labelKey: "nav.home",
      icon: "◫",
      isActive: (path) => path === "/dashboard",
    },
    {
      href: "/rooms",
      labelKey: "nav.rooms",
      icon: "◎",
      isActive: (path) => path === "/rooms" || path.startsWith("/rooms/"),
    },
    {
      href: "/messages",
      labelKey: "nav.messages",
      icon: "✉",
      isActive: (path) => path.startsWith("/messages"),
    },
    {
      href: "/notifications",
      labelKey: "nav.notifications",
      icon: "◔",
      isActive: (path) => path.startsWith("/notifications"),
    },
    {
      href: profileHref,
      labelKey: "nav.profile",
      icon: "◉",
      isActive: (path) => path.startsWith("/profile"),
    },
  ];

  return (
    <nav
      aria-label={t("nav.mobileBottom")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-topbar/95 backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = item.isActive(pathname);

          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition sm:text-xs",
                  active
                    ? "text-accent"
                    : "text-muted hover:bg-surface-hover hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <span aria-hidden className="text-base leading-none">
                  {item.icon}
                </span>
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
