import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  icon?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  href,
  icon = "◌",
  className,
}: EmptyStateProps) {
  return (
    <Card
      glow
      className={cn(
        "flex flex-col items-center px-6 py-10 text-center sm:px-8",
        className,
      )}
    >
      <span
        aria-hidden
        className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-2xl text-accent"
      >
        {icon}
      </span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>

      {actionLabel && href ? (
        <Button href={href} variant="secondary" className="mt-6">
          {actionLabel}
        </Button>
      ) : null}

      {actionLabel && onAction && !href ? (
        <Button variant="secondary" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Card>
  );
}
