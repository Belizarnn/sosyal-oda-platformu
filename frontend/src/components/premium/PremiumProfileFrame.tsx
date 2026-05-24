import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const FRAME_STYLES: Record<string, string> = {
  "violet-glow":
    "rounded-full p-[3px] bg-gradient-to-br from-violet-400 via-fuchsia-400 to-indigo-500 shadow-[0_0_24px_rgba(139,92,246,0.45)]",
  "indigo-ring":
    "rounded-full p-[3px] bg-gradient-to-br from-indigo-400 via-blue-500 to-violet-600 shadow-[0_0_20px_rgba(99,102,241,0.35)]",
  "cosmic-haze":
    "rounded-full p-[3px] bg-gradient-to-br from-purple-500/80 via-indigo-400/80 to-cyan-400/70 shadow-[0_0_28px_rgba(168,85,247,0.3)]",
};

const EFFECT_STYLES: Record<string, string> = {
  "soft-pulse": "animate-pulse",
  shimmer: "premium-shimmer",
  orbit: "premium-orbit",
};

interface PremiumProfileFrameProps {
  frame?: string | null;
  effect?: string | null;
  className?: string;
  children: ReactNode;
}

export function PremiumProfileFrame({
  frame,
  effect,
  className,
  children,
}: PremiumProfileFrameProps) {
  if (!frame) {
    return (
      <div className={cn(effect ? EFFECT_STYLES[effect] : undefined, className)}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex",
        FRAME_STYLES[frame] ?? FRAME_STYLES["violet-glow"],
        effect ? EFFECT_STYLES[effect] : undefined,
        className,
      )}
    >
      <div className="rounded-full bg-surface">{children}</div>
    </div>
  );
}
