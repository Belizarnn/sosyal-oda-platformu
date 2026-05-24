"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, resendVerificationEmail, type AuthUser } from "@/lib/api";
import { fetchCurrentUser } from "@/lib/auth";

interface EmailVerificationBannerProps {
  user: AuthUser;
  onUserUpdated?: (user: AuthUser) => void;
}

export function EmailVerificationBanner({
  user,
  onUserUpdated,
}: EmailVerificationBannerProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (user.emailVerified) {
    return null;
  }

  async function handleResend() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await resendVerificationEmail();
      setMessage(response.message);
      const refreshed = await fetchCurrentUser();
      if (refreshed) {
        onUserUpdated?.(refreshed);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("auth.verify.resendError"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-amber-100">{t("auth.verify.bannerTitle")}</p>
          <p className="mt-1 text-sm text-amber-100/80">{t("auth.verify.bannerDesc")}</p>
          {message ? <p className="mt-2 text-sm text-emerald-200">{message}</p> : null}
          {error ? <p className="mt-2 text-sm text-red-200">{error}</p> : null}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={loading}
          onClick={() => void handleResend()}
          className="shrink-0"
        >
          {loading ? t("auth.verify.resending") : t("auth.verify.resend")}
        </Button>
      </div>
    </div>
  );
}
