interface InterestTagProps {
  label: string;
}

export function InterestTag({ label }: InterestTagProps) {
  return (
    <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground/90">
      {label}
    </span>
  );
}
