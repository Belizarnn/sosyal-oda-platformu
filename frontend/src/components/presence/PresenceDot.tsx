import { getPresenceMeta } from "@/lib/presence";
import { cn } from "@/lib/cn";

interface PresenceDotProps {
  status: string;
  className?: string;
}

export function PresenceDot({ status, className }: PresenceDotProps) {
  const meta = getPresenceMeta(status);

  return (
    <span
      className={cn(
        "inline-block shrink-0 rounded-full",
        meta.dotClass,
        className ?? "h-2.5 w-2.5",
      )}
      aria-hidden
    />
  );
}
