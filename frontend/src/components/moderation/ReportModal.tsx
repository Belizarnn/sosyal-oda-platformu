"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, createReport } from "@/lib/api";
import type { ReportInput, ReportTargetType } from "@/types/moderation";

interface ReportModalProps {
  open: boolean;
  targetType: ReportTargetType;
  targetUserId?: string | null;
  targetMessageId?: string | null;
  targetRoomId?: string | null;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReportModal({
  open,
  targetType,
  targetUserId,
  targetMessageId,
  targetRoomId,
  onClose,
  onSubmitted,
}: ReportModalProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setReason("");
    setDescription("");
    setError(null);
    setSuccess(null);
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload: ReportInput = {
      targetType,
      targetUserId: targetUserId ?? null,
      targetMessageId: targetMessageId ?? null,
      targetRoomId: targetRoomId ?? null,
      reason: reason.trim(),
      description: description.trim() || null,
    };

    try {
      const response = await createReport(payload);
      setSuccess(response.message);
      onSubmitted?.();
      window.setTimeout(() => onClose(), 900);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("moderation.report.submitFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-dropdown p-6">
        <h2 className="text-lg font-semibold">{t("moderation.report.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("moderation.report.subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={120}
            required
            placeholder={t("moderation.report.reasonPlaceholder")}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t("moderation.report.descriptionPlaceholder")}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t("common.submitting") : t("chat.send")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
