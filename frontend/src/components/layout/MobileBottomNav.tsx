"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/cn";

type MobileNavItem = {
  href: string;
  labelKey: string;
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
      isActive: (path) => path === "/dashboard",
    },
    {
      href: "/rooms",
      labelKey: "nav.rooms",
      isActive: (path) => path === "/rooms" || path.startsWith("/rooms/"),
    },
    {
      href: "/messages",
      labelKey: "nav.messages",
      isActive: (path) => path.startsWith("/messages"),
    },
    {
      href: "/notifications",
      labelKey: "nav.notifications",
      isActive: (path) => path.startsWith("/notifications"),
    },
    {
      href: profileHref,
      labelKey: "nav.profile",
      isActive: (path) => path.startsWith("/profile"),
    },
  ];

  return (
    <nav
      aria-label={t("nav.mobileBottom")}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-topbar lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const active = item.isActive(pathname);

          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center rounded-lg px-1 py-2 text-[11px] font-medium transition sm:text-xs",
                  active
                    ? "text-accent"
                    : "text-muted hover:bg-surface-hover hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
