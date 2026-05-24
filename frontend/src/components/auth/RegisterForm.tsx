"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BetaBanner } from "@/components/beta/BetaBanner";
import { ApiError, register } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { saveAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePublicConfig } from "@/hooks/usePublicConfig";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const { config } = usePublicConfig();
  const [username, setUsername] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [betaCode, setBetaCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showBetaCode = config.betaAccessRequired;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    trackEvent("register_submitted");

    const normalizedHandle = handle.trim().toLowerCase();

    if (!/^[a-z0-9_]+$/.test(normalizedHandle)) {
      setError(t("auth.register.handleInvalid"));
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("auth.register.passwordMin"));
      setLoading(false);
      return;
    }

    if (showBetaCode && !betaCode.trim()) {
      setError(t("auth.register.betaCodeRequired"));
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        username: username.trim(),
        handle: normalizedHandle,
        email: email.trim().toLowerCase(),
        password,
        ...(showBetaCode ? { betaCode: betaCode.trim() } : {}),
      });
      saveAuth(result.token, result.user);
      router.push("/onboarding");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t("auth.register.error"));
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
          label={t("auth.fields.username")}
          placeholder={t("auth.fields.usernamePlaceholder")}
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
          autoComplete="name"
        />
        <Input
          label={t("auth.fields.handle")}
          placeholder={t("auth.fields.handlePlaceholder")}
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          required
          autoComplete="username"
        />
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
          autoComplete="new-password"
        />

        {showBetaCode ? (
          <div className="space-y-1.5">
            <Input
              label={t("auth.fields.betaCode")}
              placeholder={t("auth.fields.betaCodePlaceholder")}
              value={betaCode}
              onChange={(event) => setBetaCode(event.target.value.toUpperCase())}
              required
              autoComplete="off"
            />
            <p className="text-xs text-muted">{t("auth.register.betaCodeHint")}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          className="mt-2 w-full py-3 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          {loading ? t("auth.register.submitting") : t("auth.register.submit")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {t("auth.register.hasAccount")}{" "}
        <Link href="/login" className="text-accent hover:underline">
          {t("auth.register.loginLink")}
        </Link>
      </p>
    </>
  );
}
