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
        "relative inline-flex shrink-0 rounded-full transition-shadow duration-300",
        isSpeaking && "shadow-[0_0_20px_rgba(167,139,250,0.45)]",
        className,
      )}
    >
      {isSpeaking ? (
        <>
          <span
            className="absolute -inset-1 rounded-full bg-violet-400/20 voice-speaking-glow"
            aria-hidden
          />
          <span
            className="absolute inset-0 rounded-full ring-2 ring-violet-400/70 ring-offset-2 ring-offset-background voice-speaking-ring"
            aria-hidden
          />
        </>
      ) : null}
      <Avatar name={name} size={size} />
    </div>
  );
}
