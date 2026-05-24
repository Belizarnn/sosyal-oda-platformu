"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

interface LandingAuthModalProps {
  open: boolean;
  onClose: () => void;
}

export function LandingAuthModal({ open, onClose }: LandingAuthModalProps) {
  const t = useTranslations("landing.authModal");

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="landing-auth-modal-title"
        className={cn(
          "relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10",
          "bg-[rgba(15,10,30,0.92)] p-6 shadow-[0_0_80px_rgba(124,58,237,0.25)] backdrop-blur-xl sm:p-8",
        )}
      >
        <h2
          id="landing-auth-modal-title"
          className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
        >
          {t("title")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">{t("description")}</p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-500 px-6 py-3.5 text-base font-medium text-white shadow-[0_0_32px_rgba(124,58,237,0.35)] transition hover:brightness-110"
          >
            {t("login")}
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-base font-medium text-white backdrop-blur-sm transition hover:border-violet-300/30 hover:bg-white/10"
          >
            {t("register")}
          </Link>
        </div>

        <p className="mt-5 text-center text-xs leading-relaxed text-slate-400">{t("note")}</p>
      </div>
    </div>
  );
}
