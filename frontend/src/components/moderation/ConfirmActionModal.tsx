"use client";

import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ConfirmActionModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmActionModal({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmActionModalProps) {
  const { t } = useLanguage();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-dropdown p-6 shadow-[0_0_40px_var(--glow)]">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>

        <div className="mt-6 flex gap-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 ${danger ? "bg-red-600 hover:bg-red-500" : ""}`}
          >
            {loading ? t("notifications.processing") : (confirmLabel ?? t("moderation.confirm"))}
          </Button>
        </div>
      </div>
    </div>
  );
}
