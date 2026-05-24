import { cn } from "@/lib/cn";

interface PremiumBadgeProps {
  className?: string;
  size?: "sm" | "md";
}

export function PremiumBadge({ className, size = "sm" }: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 font-medium text-violet-100 shadow-[0_0_16px_rgba(139,92,246,0.25)]",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        className,
      )}
    >
      <span aria-hidden>✦</span>
      Premium
    </span>
  );
}
