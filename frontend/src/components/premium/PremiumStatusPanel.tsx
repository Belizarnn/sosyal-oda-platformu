"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { LoadingState } from "@/components/ui/LoadingState";
import { PremiumBadge } from "@/components/premium/PremiumBadge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ApiError,
  createCustomerPortalSession,
  getPremiumStatus,
  updatePremiumPreferences,
  type AuthUser,
} from "@/lib/api";
import type {
  PremiumAvatarEffect,
  PremiumProfileFrame,
  PremiumStatusResponse,
} from "@/types/premium";
import {
  PREMIUM_AVATAR_EFFECTS,
  PREMIUM_PROFILE_FRAMES,
} from "@/types/premium";

interface PremiumStatusPanelProps {
  user: AuthUser;
  onUserUpdated?: (user: AuthUser) => void;
  compact?: boolean;
}

export function PremiumStatusPanel({
  user,
  onUserUpdated,
  compact = false,
}: PremiumStatusPanelProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<PremiumStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [badgeVisible, setBadgeVisible] = useState(true);
  const [profileFrame, setProfileFrame] = useState<PremiumProfileFrame | "">(
    "",
  );
  const [avatarEffect, setAvatarEffect] = useState<PremiumAvatarEffect | "">(
    "",
  );

  useEffect(() => {
    setBadgeVisible(user.premiumBadgeVisible ?? true);
    setProfileFrame((user.premiumProfileFrame as PremiumProfileFrame) ?? "");
    setAvatarEffect((user.premiumAvatarEffect as PremiumAvatarEffect) ?? "");
  }, [user]);

  useEffect(() => {
    void getPremiumStatus()
      .then((response) => {
        setStatus(response);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : t("premium.status.loadError"),
        );
      })
      .finally(() => setLoading(false));
  }, [t]);

  async function handleManageSubscription() {
    setPortalLoading(true);
    setError(null);

    try {
      const result = await createCustomerPortalSession();
      window.location.href = result.portalUrl;
    } catch (err) {
      setPortalLoading(false);
      setError(
        err instanceof ApiError
          ? err.message
          : t("premium.settings.portalError"),
      );
    }
  }

  async function handleSave() {
    if (!status?.isPremium) {
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await updatePremiumPreferences({
        premiumBadgeVisible: badgeVisible,
        premiumProfileFrame: profileFrame || null,
        premiumAvatarEffect: avatarEffect || null,
      });
      setStatus(response.status);
      onUserUpdated?.(response.user as AuthUser);
      setMessage(t("premium.settings.saved"));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("premium.settings.saveError"),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState label={t("premium.status.loading")} rows={1} />;
  }

  if (!status?.isPremium) {
    return (
      <Card className="space-y-4 p-5">
        <div>
          <h2 className="text-lg font-semibold">{t("premium.settings.title")}</h2>
          <p className="mt-1 text-sm text-muted">{t("premium.settings.freeDesc")}</p>
        </div>
        <Button href="/premium">{t("premium.settings.explore")}</Button>
      </Card>
    );
  }

  return (
    <Card className="space-y-5 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{t("premium.settings.title")}</h2>
        <PremiumBadge />
      </div>

      {!compact ? (
        <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
          <p>
            {t("premium.settings.plan")}:{" "}
            <span className="text-foreground">{status.plan ?? "—"}</span>
          </p>
          {status.premiumExpiresAt ? (
            <p>
              {t("premium.settings.expires")}:{" "}
              <span className="text-foreground">
                {new Date(status.premiumExpiresAt).toLocaleDateString()}
              </span>
            </p>
          ) : null}
          {status.subscription?.status ? (
            <p className="sm:col-span-2">
              {t("premium.settings.subscriptionStatus")}:{" "}
              <span className="text-foreground">{status.subscription.status}</span>
              {status.subscription.cancelAtPeriodEnd
                ? ` (${t("premium.settings.cancelAtPeriodEnd")})`
                : null}
            </p>
          ) : null}
        </div>
      ) : null}

      <Button
        variant="secondary"
        disabled={portalLoading || !status.subscription}
        onClick={() => void handleManageSubscription()}
      >
        {portalLoading
          ? t("premium.settings.openingPortal")
          : t("premium.settings.manageSubscription")}
      </Button>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={badgeVisible}
          onChange={(event) => setBadgeVisible(event.target.checked)}
          className="h-4 w-4 rounded border-border accent-violet-500"
        />
        {t("premium.settings.badgeVisible")}
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="text-muted">{t("premium.settings.profileFrame")}</span>
        <select
          value={profileFrame}
          onChange={(event) =>
            setProfileFrame(event.target.value as PremiumProfileFrame | "")
          }
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-violet-400/50"
        >
          <option value="">{t("premium.settings.none")}</option>
          {PREMIUM_PROFILE_FRAMES.map((frame) => (
            <option key={frame} value={frame}>
              {frame}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5 text-sm">
        <span className="text-muted">{t("premium.settings.avatarEffect")}</span>
        <select
          value={avatarEffect}
          onChange={(event) =>
            setAvatarEffect(event.target.value as PremiumAvatarEffect | "")
          }
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 outline-none focus:border-violet-400/50"
        >
          <option value="">{t("premium.settings.none")}</option>
          {PREMIUM_AVATAR_EFFECTS.map((effect) => (
            <option key={effect} value={effect}>
              {effect}
            </option>
          ))}
        </select>
      </label>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button disabled={saving} onClick={() => void handleSave()}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
        <Link href="/premium" className="text-sm text-violet-300 hover:underline">
          {t("premium.settings.viewPlans")}
        </Link>
      </div>
    </Card>
  );
}
