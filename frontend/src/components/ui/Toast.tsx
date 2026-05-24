"use client";



import { cn } from "@/lib/cn";

import type { ToastType } from "./ToastProvider";



const styles: Record<ToastType, string> = {

  success: "border-success/30 bg-success/10 text-success",

  error: "border-error/30 bg-error/10 text-error",

  info: "border-accent/30 bg-accent-soft text-foreground",

};



const icons: Record<ToastType, string> = {

  success: "✓",

  error: "✕",

  info: "◔",

};



interface ToastProps {

  type: ToastType;

  message: string;

  onDismiss: () => void;

}



export function Toast({ type, message, onDismiss }: ToastProps) {

  return (

    <div

      role="status"

      aria-live="polite"

      className={cn(

        "pointer-events-auto flex min-w-[260px] max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-[0_8px_32px_var(--shadow)] backdrop-blur-xl",

        styles[type],

      )}

    >

      <span aria-hidden className="mt-0.5 text-sm">

        {icons[type]}

      </span>

      <p className="flex-1 text-sm leading-relaxed">{message}</p>

      <button

        type="button"

        onClick={onDismiss}

        className="shrink-0 rounded-lg px-1.5 text-xs opacity-70 transition hover:opacity-100"

        aria-label="Kapat"

      >

        ✕

      </button>

    </div>

  );

}

