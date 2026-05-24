"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, resetPassword } from "@/lib/api";

export function ResetPasswordPageContent() {
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError(t("auth.reset.invalidToken"));
      return;
    }

    if (password.length < 8) {
      setError(t("auth.reset.passwordMin"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.reset.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, password);
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.reset.error"));
    } finally {
      setLoading(false);
    }
  }

  if (!token && !successMessage) {
    return (
      <Card className="relative z-10 w-full max-w-md text-center" glow>
        <h1 className="text-xl font-semibold">{t("auth.reset.title")}</h1>
        <p className="mt-4 text-sm text-red-300">{t("auth.reset.invalidToken")}</p>
        <Button variant="secondary" href="/forgot-password" className="mt-6">
          {t("auth.reset.requestNewLink")}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="relative z-10 w-full max-w-md" glow>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold">{t("auth.reset.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("auth.reset.subtitle")}</p>
      </div>

      {successMessage ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
          </div>
          <Button href="/login" className="w-full">
            {t("auth.reset.goLogin")}
          </Button>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <Input
            label={t("auth.reset.newPassword")}
            type="password"
            placeholder={t("auth.fields.passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Input
            label={t("auth.reset.confirmPassword")}
            type="password"
            placeholder={t("auth.fields.passwordPlaceholder")}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("auth.reset.submitting") : t("auth.reset.submit")}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="text-accent hover:underline">
          {t("auth.forgot.backToLogin")}
        </Link>
      </p>
    </Card>
  );
}
