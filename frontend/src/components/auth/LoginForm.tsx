"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BetaBanner } from "@/components/beta/BetaBanner";
import { ApiError, login } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { saveAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";

export function LoginForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    trackEvent("login_submitted");

    try {
      const result = await login({
        email: email.trim().toLowerCase(),
        password,
      });
      saveAuth(result.token, result.user);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("auth.login.error"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <BetaBanner className="mb-4" />

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
        <Input
          label={t("auth.fields.password")}
          type="password"
          placeholder={t("auth.fields.passwordPlaceholder")}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          autoComplete="current-password"
        />
        <Button
          type="submit"
          className="mt-2 w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>
      </form>

      <p className="mt-3 text-center text-sm">
        <Link href="/forgot-password" className="text-accent hover:underline">
          {t("auth.login.forgotPassword")}
        </Link>
      </p>

      <p className="mt-6 text-center text-sm text-muted">
        {t("auth.login.noAccount")}{" "}
        <Link href="/register" className="text-accent hover:underline">
          {t("auth.login.registerLink")}
        </Link>
      </p>
    </>
  );
}
