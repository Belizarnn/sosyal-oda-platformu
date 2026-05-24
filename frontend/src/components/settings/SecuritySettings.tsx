"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, changePassword } from "@/lib/api";

export function SecuritySettings() {
  const { t } = useLanguage();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmNewPassword) {
      setError(t("settings.security.passwordMismatch"));
      return;
    }

    setLoading(true);

    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      });
      const message = response.message || t("settings.security.passwordUpdated");
      setSuccessMessage(message);
      showSuccessToast(message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : t("settings.security.passwordUpdateFailed");
      setError(message);
      showErrorToast(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card glow className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("settings.security.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("settings.security.subtitleExtended")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t("settings.security.currentPassword")}
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
        />

        <Input
          label={t("settings.security.newPassword")}
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          autoComplete="new-password"
        />

        <Input
          label={t("settings.security.confirmPassword")}
          type="password"
          value={confirmNewPassword}
          onChange={(event) => setConfirmNewPassword(event.target.value)}
          autoComplete="new-password"
        />

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        {successMessage ? (
          <p className="text-sm text-emerald-300">{successMessage}</p>
        ) : null}

        <Button type="submit" disabled={loading}>
          {loading ? t("settings.security.updating") : t("settings.security.updatePassword")}
        </Button>
      </form>
    </Card>
  );
}
