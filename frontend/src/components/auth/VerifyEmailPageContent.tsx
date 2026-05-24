"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, verifyEmail } from "@/lib/api";
import { fetchCurrentUser, getToken } from "@/lib/auth";

export function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage(t("auth.verify.invalid"));
      return;
    }

    void verifyEmail(token)
      .then(async (response) => {
        if (getToken()) {
          await fetchCurrentUser();
        }
        setStatus("success");
        setMessage(response.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiError ? err.message : t("auth.verify.invalid"),
        );
      });
  }, [searchParams, t]);

  return (
    <Card className="relative z-10 w-full max-w-md text-center" glow>
      <h1 className="text-xl font-semibold">{t("auth.verify.title")}</h1>

      {status === "loading" ? (
        <div className="mt-6">
          <LoadingState label={t("auth.verify.loading")} rows={1} />
        </div>
      ) : null}

      {status === "success" ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-muted">{message ?? t("auth.verify.success")}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button href="/login">{t("auth.verify.goLogin")}</Button>
            <Button variant="secondary" href="/dashboard">
              {t("auth.verify.goDashboard")}
            </Button>
          </div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-red-300">{message ?? t("auth.verify.invalid")}</p>
          <Button variant="secondary" href="/login">
            {t("auth.verify.goLogin")}
          </Button>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-muted">
        <Link href="/" className="text-accent hover:underline">
          {t("nav.home")}
        </Link>
      </p>
    </Card>
  );
}
