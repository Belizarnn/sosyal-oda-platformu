"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, getInvitePreview } from "@/lib/api";

interface EnterInviteCodeModalProps {
  open: boolean;
  onClose: () => void;
}

export function EnterInviteCodeModal({ open, onClose }: EnterInviteCodeModalProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = code.trim().toUpperCase();

    if (!trimmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await getInvitePreview(trimmed);
      onClose();
      setCode("");
      router.push(`/invite/${encodeURIComponent(trimmed)}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("invite.invalidDesc"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-[var(--overlay)]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-dropdown p-5 shadow-lg">
        <h2 className="text-lg font-semibold">{t("dashboard.inviteCode.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("dashboard.inviteCode.desc")}</p>

        <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
          <Input
            label={t("dashboard.inviteCode.label")}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder={t("dashboard.inviteCode.placeholder")}
            autoFocus
          />
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !code.trim()} className="flex-1">
              {loading ? t("common.loading") : t("dashboard.inviteCode.submit")}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
