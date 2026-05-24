"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export function LandingFooter() {
  const { t } = useLanguage();

  const links = [
    { href: "/community-guidelines", labelKey: "footer.communityGuidelines" },
    { href: "/privacy", labelKey: "footer.privacy" },
    { href: "/terms", labelKey: "footer.terms" },
    { href: "/beta", labelKey: "footer.beta" },
    { href: "/login", labelKey: "footer.login" },
    { href: "/register", labelKey: "footer.register" },
  ];

  return (
    <footer className="relative z-10 border-t border-white/10 px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-300">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition hover:text-white"
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
        <p className="text-center text-xs text-slate-400">
          {t("footer.copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
