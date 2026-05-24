"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, submitFeedback } from "@/lib/api";
import type { FeedbackType } from "@/types/feedback";
import { FeedbackTypeSelect } from "./FeedbackTypeSelect";
import { RatingInput } from "./RatingInput";

interface FeedbackModalProps {
  open: boolean;
  onClose: () => void;
}

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const { t } = useLanguage();
  const [type, setType] = useState<FeedbackType>("GENERAL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setType("GENERAL");
    setTitle("");
    setMessage("");
    setRating(null);
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

    try {
      const response = await submitFeedback({
        type,
        title: title.trim(),
        message: message.trim(),
        rating,
        pageUrl:
          typeof window !== "undefined" ? window.location.pathname : null,
      });
      setSuccess(response.message);
      window.setTimeout(() => onClose(), 1200);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : t("feedback.submitFailed"),
      );
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

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-dropdown p-6"
      >
        <h2 id="feedback-modal-title" className="text-lg font-semibold">
          {t("feedback.title")}
        </h2>
        <p className="mt-1 text-sm text-muted">{t("feedback.subtitle")}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-sm text-muted">{t("feedback.typeLabel")}</p>
            <FeedbackTypeSelect value={type} onChange={setType} />
          </div>

          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
            required
            placeholder={t("feedback.titlePlaceholder")}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />

          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={1000}
            required
            rows={4}
            placeholder={t("feedback.messagePlaceholder")}
            className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-accent/50"
          />

          <RatingInput value={rating} onChange={setRating} />

          <p className="text-xs text-muted">{t("feedback.privacyNote")}</p>

          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? t("common.submitting") : t("feedback.submit")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
