"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import type { TypingUser } from "@/types/message";

interface TypingIndicatorProps {
  users: TypingUser[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  const { t } = useLanguage();

  if (users.length === 0) {
    return null;
  }

  let text: string;

  if (users.length === 1) {
    text = t("chat.typing", { name: users[0].username });
  } else if (users.length === 2) {
    text = t("chat.typingTwo", {
      first: users[0].username,
      second: users[1].username,
    });
  } else {
    text = t("chat.typingMultiple", {
      first: users[0].username,
      second: users[1].username,
      count: users.length - 2,
    });
  }

  return (
    <div className="border-t border-border px-4 py-2 text-xs text-muted">
      {text}
    </div>
  );
}
