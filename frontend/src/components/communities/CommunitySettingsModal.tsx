"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CommunityInviteModal } from "@/components/communities/CommunityInviteModal";
import { RolesSettings } from "@/components/communities/RolesSettings";
import { ServerBotsSettings } from "@/components/communities/ServerBotsSettings";
import { useLanguage } from "@/contexts/LanguageContext";
import { channelTypeLabelKey, formatChannelLabel } from "@/lib/communityUi";
import {
  ApiError,
  deleteCommunity,
  getCommunityById,
  leaveCommunity,
  updateCommunity,
  updateCommunityMember,
} from "@/lib/api";
import type {
  CommunityChannel,
  CommunityDetail,
  CommunityMember,
  CommunityMemberRole,
  CommunityVisibility,
} from "@/types/community";

type SettingsTab =
  | "general"
  | "channels"
  | "members"
  | "invites"
  | "roles"
  | "bots"
  | "security";

const VISIBILITIES: CommunityVisibility[] = ["PUBLIC", "INVITE_ONLY", "PRIVATE"];

const ASSIGNABLE_ROLES: CommunityMemberRole[] = [
  "ADMIN",
  "MODERATOR",
  "MEMBER",
  "GUEST",
];

interface CommunitySettingsModalProps {
  communityId: string;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
  initialTab?: SettingsTab;
}

export function CommunitySettingsModal({
  communityId,
  open,
  onClose,
  onUpdated,
  initialTab = "general",
}: CommunitySettingsModalProps) {
  const { t } = useLanguage();
  const [tab, setTab] = useState<SettingsTab>(initialTab);
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [channels, setChannels] = useState<CommunityChannel[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<CommunityMemberRole | null>(null);
  const [canManageSettings, setCanManageSettings] = useState(false);
  const [canManageRoles, setCanManageRoles] = useState(false);
  const [canViewMembers, setCanViewMembers] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManage =
    canManageSettings ||
    currentUserRole === "OWNER" ||
    currentUserRole === "ADMIN" ||
    currentUserRole === "MODERATOR";

  useEffect(() => {
    if (!open) {
      return;
    }
    setTab(initialTab);
    void load();
  }, [open, communityId, initialTab]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCommunityById(communityId);
      setCommunity(data.community);
      setChannels(data.channels);
      setMembers(data.members);
      setCurrentUserRole(data.currentUserRole);
      setCanManageSettings(Boolean(data.canManageSettings));
      setCanManageRoles(Boolean(data.canManageRoles));
      setCanViewMembers(Boolean(data.canViewMembers));
      setName(data.community.name);
      setDescription(data.community.description ?? "");
      setAvatarUrl(data.community.avatarUrl ?? "");
      setVisibility(data.community.visibility);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("states.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveGeneral(event: React.FormEvent) {
    event.preventDefault();
    if (!canManageSettings) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateCommunity(communityId, {
        name: name.trim(),
        description: description.trim() || undefined,
        avatarUrl: avatarUrl.trim() || null,
        visibility,
      });
      onUpdated();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.settings.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRoleChange(memberId: string, role: CommunityMemberRole) {
    setLoading(true);
    setError(null);
    try {
      await updateCommunityMember(communityId, memberId, { role });
      onUpdated();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.settings.roleUpdateFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    setLoading(true);
    try {
      await leaveCommunity(communityId);
      onClose();
      window.location.href = "/communities";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.settings.leaveFailed"));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(t("communities.settings.deleteConfirm"))) {
      return;
    }
    setLoading(true);
    try {
      await deleteCommunity(communityId);
      onClose();
      window.location.href = "/communities";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.settings.deleteFailed"));
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  const allTabs: SettingsTab[] = [
    "general",
    "channels",
    "roles",
    "members",
    "bots",
    "invites",
    "security",
  ];

  const visibleTabs = allTabs.filter((item) => {
    if (item === "roles") return canManageRoles;
    if (item === "bots") return canManageSettings || canManage;
    if (item === "members") return canViewMembers || canManage;
    if (item === "general" || item === "channels" || item === "invites" || item === "security") {
      return canManageSettings || canManage || item === "security";
    }
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-4">
        <button
          type="button"
          aria-label={t("common.close")}
          className="absolute inset-0 bg-[var(--overlay)]"
          onClick={onClose}
        />
        <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border bg-dropdown shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-lg font-semibold">{t("communities.settings.title")}</h2>
            <button type="button" className="text-sm text-muted hover:text-foreground" onClick={onClose}>
              {t("common.close")}
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col sm:flex-row">
            <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 sm:w-44 sm:flex-col sm:border-b-0 sm:border-r">
              {visibleTabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap ${
                    tab === item
                      ? "bg-accent-soft font-medium text-foreground"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {t(`communities.settings.tabs.${item}`)}
                </button>
              ))}
            </nav>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {error ? <p className="mb-3 text-sm text-red-300">{error}</p> : null}
              {loading && !community ? (
                <p className="text-sm text-muted">{t("common.loading")}</p>
              ) : null}

              {tab === "general" && (
                <form className="space-y-3" onSubmit={(event) => void handleSaveGeneral(event)}>
                  <Input label={t("communities.form.name")} value={name} onChange={(e) => setName(e.target.value)} disabled={!canManageSettings} />
                  <label className="block space-y-1.5">
                    <span className="text-sm text-muted">{t("communities.form.description")}</span>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      disabled={!canManageSettings}
                      className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm"
                    />
                  </label>
                  <Input
                    label={t("communities.form.avatarUrl")}
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    disabled={!canManageSettings}
                    placeholder="https://"
                  />
                  <label className="block space-y-1.5">
                    <span className="text-sm text-muted">{t("communities.form.visibility")}</span>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as CommunityVisibility)}
                      disabled={!canManageSettings}
                      className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm"
                    >
                      {VISIBILITIES.map((item) => (
                        <option key={item} value={item}>
                          {t(`communities.visibility.${item.toLowerCase()}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {canManageSettings ? (
                    <Button type="submit" disabled={loading}>
                      {loading ? t("common.loading") : t("communities.settings.save")}
                    </Button>
                  ) : null}
                </form>
              )}

              {tab === "channels" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">{t("communities.settings.channelsDesc")}</p>
                  <ul className="space-y-2">
                    {channels.map((channel) => (
                      <li
                        key={channel.id}
                        className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/40 px-3 py-2"
                      >
                        <span className="min-w-0 flex-1 text-sm">{formatChannelLabel(channel)}</span>
                        <span className="rounded-md bg-surface px-2 py-0.5 text-[10px] text-muted">
                          {t(channelTypeLabelKey(channel.type))}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted">{t("communities.settings.channelsHint")}</p>
                </div>
              )}

              {tab === "members" && (canViewMembers || canManage) && (
                <ul className="space-y-2">
                  {members.map((member) => (
                    <li
                      key={member.id}
                      className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/40 px-3 py-2"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">
                        {member.user.username}
                      </span>
                      {canManage && member.role !== "OWNER" ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            void handleRoleChange(member.id, e.target.value as CommunityMemberRole)
                          }
                          disabled={loading}
                          className="rounded-lg border border-border bg-input px-2 py-1 text-xs"
                        >
                          {ASSIGNABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {t(`communities.roles.${role.toLowerCase()}`)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-muted">
                          {t(`communities.roles.${member.role.toLowerCase()}`)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {tab === "invites" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">{t("communities.inviteDesc")}</p>
                  {canManage ? (
                    <Button onClick={() => setInviteOpen(true)}>{t("communities.createInvite")}</Button>
                  ) : (
                    <p className="text-sm text-muted">{t("communities.settings.inviteRestricted")}</p>
                  )}
                </div>
              )}

              {tab === "roles" && canManageRoles ? (
                <RolesSettings
                  communityId={communityId}
                  members={members}
                  canManage={canManageRoles}
                  onUpdated={() => {
                    onUpdated();
                    void load();
                  }}
                />
              ) : null}

              {tab === "bots" && (canManageSettings || canManage) ? (
                <ServerBotsSettings
                  communityId={communityId}
                  canManage={canManageSettings || canManage}
                />
              ) : null}

              {tab === "security" && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">{t("communities.settings.securityDesc")}</p>
                  {currentUserRole !== "OWNER" ? (
                    <Button variant="secondary" onClick={() => void handleLeave()} disabled={loading}>
                      {t("communities.settings.leave")}
                    </Button>
                  ) : null}
                  {currentUserRole === "OWNER" ? (
                    <Button variant="secondary" onClick={() => void handleDelete()} disabled={loading}>
                      {t("communities.settings.delete")}
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CommunityInviteModal
        communityId={communityId}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  );
}
