"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";

interface DMMessageInputProps {
  disabled?: boolean;
  onSend: (content: string) => Promise<void>;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export function DMMessageInput({
  disabled = false,
  onSend,
  onTypingStart,
  onTypingStop,
}: DMMessageInputProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
      }

      if (isTypingRef.current) {
        onTypingStop();
      }
    };
  }, [onTypingStop]);

  function handleTypingChange(nextValue: string) {
    setValue(nextValue);

    if (disabled) {
      return;
    }

    if (nextValue.trim().length === 0) {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop();
      }

      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      return;
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTypingStart();
    }

    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
      isTypingRef.current = false;
      onTypingStop();
      typingTimeoutRef.current = null;
    }, 1200);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = value.trim();

    if (!content || disabled || sending) {
      return;
    }

    setSending(true);

    try {
      await onSend(content);
      setValue("");

      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop();
      }
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <div className="border-t border-border bg-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2 sm:gap-3">
        <textarea
          value={value}
          onChange={(event) => handleTypingChange(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          maxLength={1000}
          rows={2}
          placeholder={t("chat.placeholder")}
          className={cn(
            "min-h-11 max-h-32 flex-1 resize-none rounded-2xl border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted/70 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)] sm:min-h-[48px] sm:text-sm",
            (disabled || sending) && "cursor-not-allowed opacity-60",
          )}
        />
        <Button
          type="submit"
          disabled={disabled || sending || !value.trim()}
          className="shrink-0 self-end px-4 sm:px-5"
        >
          {sending ? t("chat.sending") : t("chat.send")}
        </Button>
      </form>
    </div>
  );
}
