import { cn } from "@/lib/cn";

interface RoomCategoryPillProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function RoomCategoryPill({
  label,
  active = false,
  onClick,
}: RoomCategoryPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition",
        active
          ? "border-accent/40 bg-accent/15 text-foreground shadow-[0_0_16px_var(--accent-soft)]"
          : "border-border bg-surface text-muted hover:border-border hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
