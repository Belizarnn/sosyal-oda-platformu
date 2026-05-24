"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

interface PolicyPageLayoutProps {
  titleKey: string;
  subtitleKey: string;
  disclaimerKey: string;
  sectionKeys: string[];
  children?: React.ReactNode;
}

export function PolicyPageLayout({
  titleKey,
  subtitleKey,
  disclaimerKey,
  sectionKeys,
  children,
}: PolicyPageLayoutProps) {
  const { t } = useLanguage();

  return (
    <div className="relative min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 glow-bg" />

      <article className="relative z-10 mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-muted transition hover:text-foreground">
          ← {t("common.backHome")}
        </Link>

        <header className="mt-6 space-y-3">
          <h1 className="text-3xl font-semibold">{t(titleKey)}</h1>
          <p className="text-muted">{t(subtitleKey)}</p>
          <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
            {t(disclaimerKey)}
          </p>
        </header>

        <div className="mt-8 space-y-6">
          {sectionKeys.map((sectionKey) => (
            <section
              key={sectionKey}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <h2 className="text-lg font-semibold">
                {t(`${sectionKey}.title`)}
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">
                {t(`${sectionKey}.body`)}
              </p>
            </section>
          ))}
          {children}
        </div>
      </article>
    </div>
  );
}
