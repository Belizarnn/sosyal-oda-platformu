"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreateCommunityModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCommunityModal({ open, onClose }: CreateCommunityModalProps) {
  const router = useRouter();
  const { t } = useLanguage();

  if (!open) {
    return null;
  }

  function handleStart() {
    onClose();
    router.push("/communities/create");
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
        <h2 className="text-lg font-semibold">{t("communities.create")}</h2>
        <p className="mt-1 text-sm text-muted">{t("communities.wizard.modalDesc")}</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={handleStart} className="flex-1">
            {t("communities.wizard.start")}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
