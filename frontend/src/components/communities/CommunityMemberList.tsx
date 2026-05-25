"use client";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/cn";
import type { CommunityMember, CommunityMemberRole } from "@/types/community";

interface CommunityMemberListProps {
  members: CommunityMember[];
  open?: boolean;
  onClose?: () => void;
  inline?: boolean;
}

const ROLE_ORDER: CommunityMemberRole[] = [
  "OWNER",
  "ADMIN",
  "MODERATOR",
  "MEMBER",
  "GUEST",
];

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

  const grouped = ROLE_ORDER.map((role) => ({
    role,
    members: members.filter((member) => member.role === role),
  })).filter((group) => group.members.length > 0);

  const content = (
    <>
      <div className="flex items-center justify-between border-b border-border p-3">
        <h3 className="text-sm font-semibold">
          {t("communities.members")} — {members.length}
        </h3>
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
      <div className="flex-1 overflow-y-auto p-2">
        {grouped.map(({ role, members: roleMembers }) => (
          <div key={role} className="mb-3">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
              {t(`communities.roles.${role.toLowerCase()}`)} — {roleMembers.length}
            </p>
            <ul className="space-y-0.5">
              {roleMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-surface-hover"
                >
                  <Avatar name={member.user.username} src={member.user.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{member.user.username}</p>
                    <p className="truncate text-xs text-muted">@{member.user.handle}</p>
                  </div>
                  {inline ? (
                    <Badge variant="muted" className="shrink-0 text-[10px]">
                      {t(`communities.roles.${member.role.toLowerCase()}`)}
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );

  if (inline) {
    return (
      <aside className="hidden w-56 shrink-0 flex-col border-l border-border bg-sidebar xl:flex">
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
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-border bg-sidebar xl:hidden",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        {content}
      </aside>
    </>
  );
}
