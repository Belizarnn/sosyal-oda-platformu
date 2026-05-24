"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, forgotPassword } from "@/lib/api";

export function ForgotPasswordPageContent() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const response = await forgotPassword(email.trim().toLowerCase());
      setSuccessMessage(response.message);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("auth.forgot.error"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="relative z-10 w-full max-w-md" glow>
      <div className="mb-6 text-center">
        <h1 className="text-xl font-semibold">{t("auth.forgot.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t("auth.forgot.subtitle")}</p>
      </div>

      {successMessage ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
          </div>
          <Button variant="secondary" href="/login" className="w-full">
            {t("auth.forgot.backToLogin")}
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
            label={t("auth.fields.email")}
            type="email"
            placeholder={t("auth.fields.emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t("auth.forgot.submitting") : t("auth.forgot.submit")}
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
