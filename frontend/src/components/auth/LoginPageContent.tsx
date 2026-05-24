"use client";

import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export function LoginPageContent() {
  const { t } = useLanguage();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 glow-bg" />
      <Card className="relative z-10 w-full max-w-md" glow>
        <div className="mb-6 text-center">
          <Link href="/" className="text-lg font-semibold">
            {t("common.brandFull")}
          </Link>
          <p className="mt-2 text-sm text-muted">{t("auth.login.subtitle")}</p>
        </div>
        <LoginForm />
      </Card>
    </div>
  );
}
