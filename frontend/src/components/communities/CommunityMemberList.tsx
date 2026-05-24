"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import type { CommunityMember } from "@/types/community";

interface CommunityMemberListProps {
  members: CommunityMember[];
  open?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

export function CommunityMemberList({
  members,
  open = true,
  onClose,
  inline = false,
}: CommunityMemberListProps) {
  const { t } = useLanguage();

  if (!inline && !open) {
    return null;
  }

  const content = (
    <>
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="text-sm font-semibold">{t("communities.members")}</h3>
        {onClose && !inline ? (
          <button
            type="button"
            className="text-xs text-muted hover:text-foreground"
            onClick={onClose}
          >
            {t("common.close")}
          </button>
        ) : null}
      </div>
      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface-hover"
          >
            <Avatar name={member.user.username} src={member.user.avatarUrl} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.user.username}</p>
              <p className="truncate text-xs text-muted">@{member.user.handle}</p>
            </div>
            <Badge variant="muted" className="shrink-0 text-[10px]">
              {t(`communities.roles.${member.role.toLowerCase()}`)}
            </Badge>
          </li>
        ))}
      </ul>
    </>
  );

  if (inline) {
    return (
      <aside className="flex w-56 shrink-0 flex-col border-l border-border bg-sidebar">
        {content}
      </aside>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-[var(--overlay)] xl:hidden"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-64 flex-col border-l border-border bg-sidebar xl:hidden">
        {content}
      </aside>
    </>
  );
}
