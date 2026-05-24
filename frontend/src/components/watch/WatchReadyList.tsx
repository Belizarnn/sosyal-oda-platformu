"use client";

import type { WatchReadyUser } from "@/types/watch";

interface WatchReadyListProps {
  readyUsers: WatchReadyUser[];
  currentUserId?: string | null;
}

export function WatchReadyList({ readyUsers, currentUserId }: WatchReadyListProps) {
  if (readyUsers.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
        Henüz hazır olan kullanıcı yok.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {readyUsers.map((user) => (
        <li
          key={user.id}
          className="flex items-center justify-between rounded-lg border border-border/60 bg-surface/40 px-3 py-2"
        >
          <div>
            <p className="text-sm font-medium">
              {user.username}
              {user.id === currentUserId ? " (sen)" : ""}
            </p>
            <p className="text-xs text-muted">@{user.handle}</p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
              user.isReady
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-surface text-muted"
            }`}
          >
            {user.isReady ? "Hazır" : "Bekliyor"}
          </span>
        </li>
      ))}
    </ul>
  );
}
