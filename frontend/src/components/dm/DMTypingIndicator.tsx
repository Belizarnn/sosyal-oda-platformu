"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface DMTypingIndicatorProps {
  username?: string;
}

export function DMTypingIndicator({ username }: DMTypingIndicatorProps) {
  const { t } = useLanguage();

  if (!username) {
    return null;
  }

  return (
    <div className="border-t border-border px-4 py-2 text-xs text-muted">
      {t("chat.typing", { name: username })}
    </div>
  );
}
