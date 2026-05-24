"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, updatePresence, type AuthUser } from "@/lib/api";
import { updateStoredUser } from "@/lib/auth";

interface StatusMessageEditorProps {
  user: AuthUser;
  onUpdated: (user: AuthUser) => void;
}

const MAX_LENGTH = 80;

export function StatusMessageEditor({
  user,
  onUpdated,
}: StatusMessageEditorProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState(user.statusMessage ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMessage(user.statusMessage ?? "");
  }, [user.statusMessage]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const trimmed = message.trim();

    try {
      const { user: updatedUser } = await updatePresence({
        presenceStatus: user.presenceStatus,
        statusMessage: trimmed.length > 0 ? trimmed : null,
      });
      updateStoredUser(updatedUser);
      onUpdated(updatedUser);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("presence.statusSaveFailed"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSave}>
      <Input
        label={t("profile.statusMessage")}
        placeholder={t("presence.statusPlaceholder")}
        value={message}
        maxLength={MAX_LENGTH}
        onChange={(event) => setMessage(event.target.value)}
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted">
          {message.length}/{MAX_LENGTH}
        </span>
        <Button
          type="submit"
          variant="secondary"
          disabled={loading}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t("common.saving") : t("common.save")}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      {success ? (
        <p className="text-sm text-emerald-300">{t("profile.statusUpdated")}</p>
      ) : null}
    </form>
  );
}
