import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/Avatar";

interface SpeakingIndicatorProps {
  name: string;
  isSpeaking: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function SpeakingIndicator({
  name,
  isSpeaking,
  size = "md",
  className,
}: SpeakingIndicatorProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 rounded-full",
        isSpeaking && "shadow-[0_0_12px_var(--glow)]",
        className,
      )}
    >
      {isSpeaking ? (
        <span
          className="absolute inset-0 animate-pulse rounded-full ring-2 ring-accent/60 ring-offset-2 ring-offset-background"
          aria-hidden
        />
      ) : null}
      <Avatar name={name} size={size} />
    </div>
  );
}
