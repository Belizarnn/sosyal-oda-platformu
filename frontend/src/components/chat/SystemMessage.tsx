interface SystemMessageProps {
  text: string;
}

export function SystemMessage({ text }: SystemMessageProps) {
  return (
    <div className="flex justify-center py-1">
      <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
        {text}
      </span>
    </div>
  );
}
