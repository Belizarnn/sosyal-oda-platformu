import { Badge } from "@/components/ui/Badge";
import type { WatchHost } from "@/types/watch";

interface WatchHostBadgeProps {
  host: WatchHost;
  isCurrentUserHost: boolean;
}

export function WatchHostBadge({ host, isCurrentUserHost }: WatchHostBadgeProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      <Badge variant="accent">Host</Badge>
      <span className="text-sm">
        @{host.handle}
        {isCurrentUserHost ? " (sen)" : ""}
      </span>
    </div>
  );
}
