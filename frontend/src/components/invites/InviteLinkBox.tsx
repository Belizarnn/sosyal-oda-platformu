"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import { APP_BASE_URL } from "@/lib/env";

interface InviteLinkBoxProps {
  inviteCode: string;
  inviteEnabled: boolean;
}

export function InviteLinkBox({ inviteCode, inviteEnabled }: InviteLinkBoxProps) {
  const { t } = useLanguage();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${APP_BASE_URL.replace(/\/$/, "")}/invite/${inviteCode}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      success(t("invite.copySuccess"));
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground/90">{t("invite.linkTitle")}</p>
        <p className="mt-1 text-xs text-muted">
          {inviteEnabled ? t("invite.linkEnabledDesc") : t("invite.linkDisabledDesc")}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={inviteUrl}
          className={cn(
            "min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs text-foreground/90 outline-none",
            !inviteEnabled && "opacity-60",
          )}
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={handleCopy}
          disabled={!inviteEnabled}
        >
          {copied ? t("common.copied") : t("common.copy")}
        </Button>
      </div>
    </div>
  );
}
