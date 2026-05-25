"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ADMINISTRATOR_PERMISSION,
  CRITICAL_PERMISSIONS,
  PERMISSION_CATEGORIES,
  PERMISSION_CATEGORY_ORDER,
  type CommunityPermissionKey,
  type RolePermissionsMap,
} from "@/lib/communityPermissions";
import {
  ApiError,
  assignCommunityMemberRole,
  createCommunityRole,
  deleteCommunityRole,
  getCommunityRole,
  listCommunityRoles,
  removeCommunityMemberRole,
  reorderCommunityRoles,
  updateCommunityRole,
} from "@/lib/api";
import type { CommunityMember, CommunityRole, CommunityRoleMember } from "@/types/community";

type RoleEditorTab = "appearance" | "permissions" | "members";

interface RolesSettingsProps {
  communityId: string;
  members: CommunityMember[];
  canManage: boolean;
  onUpdated?: () => void;
}

function PermissionSwitch({
  permission,
  checked,
  disabled,
  onChange,
}: {
  permission: CommunityPermissionKey;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  const { t } = useLanguage();
  const isCritical = CRITICAL_PERMISSIONS.has(permission);

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg px-2 py-2 hover:bg-surface-hover/60">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          {t(`communities.rolePermissions.${permission.replace(/\./g, "_")}`)}
        </p>
        {isCritical && checked ? (
          <p className="mt-1 text-xs text-amber-400">
            {permission === ADMINISTRATOR_PERMISSION
              ? t("communities.roles.adminWarning")
              : t("communities.roles.criticalWarning")}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-accent" : "bg-border"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function RolePreview({ role }: { role: Pick<CommunityRole, "name" | "color" | "iconUrl"> }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2">
      {role.iconUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={role.iconUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
      ) : (
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: role.color }}
        />
      )}
      <span className="text-sm font-medium" style={{ color: role.color }}>
        {role.name}
      </span>
    </div>
  );
}

export function RolesSettings({
  communityId,
  members,
  canManage,
  onUpdated,
}: RolesSettingsProps) {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<CommunityRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [roleMembers, setRoleMembers] = useState<CommunityRoleMember[]>([]);
  const [editorTab, setEditorTab] = useState<RoleEditorTab>("appearance");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    server: true,
  });

  const [draft, setDraft] = useState<{
    name: string;
    color: string;
    iconUrl: string;
    hoist: boolean;
    mentionable: boolean;
    permissions: RolePermissionsMap;
  } | null>(null);

  const [memberSearch, setMemberSearch] = useState("");

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const loadRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCommunityRoles(communityId);
      setRoles(data.roles);
      if (!selectedRoleId && data.roles.length > 0) {
        setSelectedRoleId(data.roles[0].id);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("states.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [communityId, selectedRoleId, t]);

  const loadRoleDetail = useCallback(
    async (roleId: string) => {
      try {
        const data = await getCommunityRole(communityId, roleId);
        setRoleMembers(data.members);
        setDraft({
          name: data.role.name,
          color: data.role.color,
          iconUrl: data.role.iconUrl ?? "",
          hoist: data.role.hoist,
          mentionable: data.role.mentionable,
          permissions: { ...data.role.permissions },
        });
        setRoles((prev) =>
          prev.map((role) => (role.id === roleId ? data.role : role)),
        );
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("states.error.loadFailed"));
      }
    },
    [communityId, t],
  );

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    if (selectedRoleId) {
      void loadRoleDetail(selectedRoleId);
    }
  }, [selectedRoleId, loadRoleDetail]);

  async function handleCreateRole() {
    if (!canManage) return;
    setSaving(true);
    setError(null);
    try {
      const result = await createCommunityRole(communityId, {
        name: t("communities.roles.newRoleName"),
        color: "#99AAB5",
      });
      await loadRoles();
      setSelectedRoleId(result.role.id);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.roles.createFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveRole() {
    if (!selectedRoleId || !draft || !canManage) return;
    setSaving(true);
    setError(null);
    try {
      await updateCommunityRole(communityId, selectedRoleId, {
        name: draft.name.trim(),
        color: draft.color,
        iconUrl: draft.iconUrl.trim() || null,
        hoist: draft.hoist,
        mentionable: draft.mentionable,
        permissions: draft.permissions,
      });
      await loadRoleDetail(selectedRoleId);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.roles.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRole() {
    if (!selectedRole || !canManage || selectedRole.isDefault) return;
    if (!window.confirm(t("communities.roles.deleteConfirm"))) return;
    setSaving(true);
    try {
      await deleteCommunityRole(communityId, selectedRole.id);
      setSelectedRoleId(null);
      setDraft(null);
      await loadRoles();
      onUpdated?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.roles.deleteFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleMoveRole(roleId: string, direction: "up" | "down") {
    if (!canManage) return;
    const index = roles.findIndex((role) => role.id === roleId);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= roles.length) return;

    const reordered = [...roles];
    const [item] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, item);

    setSaving(true);
    try {
      const result = await reorderCommunityRoles(communityId, {
        roleIds: reordered.map((role) => role.id),
      });
      setRoles(result.roles);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.roles.reorderFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleAssignMember(memberId: string) {
    if (!selectedRoleId || !canManage) return;
    setSaving(true);
    try {
      await assignCommunityMemberRole(communityId, memberId, selectedRoleId);
      await loadRoleDetail(selectedRoleId);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.roles.assignFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!selectedRoleId || !canManage) return;
    setSaving(true);
    try {
      await removeCommunityMemberRole(communityId, memberId, selectedRoleId);
      await loadRoleDetail(selectedRoleId);
      onUpdated?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.roles.removeFailed"));
    } finally {
      setSaving(false);
    }
  }

  function togglePermission(key: CommunityPermissionKey, value: boolean) {
    if (!draft) return;
    const next = { ...draft.permissions, [key]: value };
    if (key === ADMINISTRATOR_PERMISSION && value) {
      for (const category of PERMISSION_CATEGORY_ORDER) {
        for (const perm of PERMISSION_CATEGORIES[category]) {
          next[perm] = true;
        }
      }
    }
    setDraft({ ...draft, permissions: next });
  }

  const filteredCategories = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();
    if (!query) return PERMISSION_CATEGORY_ORDER;
    return PERMISSION_CATEGORY_ORDER.filter((category) =>
      PERMISSION_CATEGORIES[category].some((perm) => {
        const label = t(`communities.rolePermissions.${perm.replace(/\./g, "_")}`).toLowerCase();
        return label.includes(query) || perm.includes(query);
      }),
    );
  }, [permissionSearch, t]);

  const assignableMembers = useMemo(() => {
    const assignedIds = new Set(roleMembers.map((item) => item.memberId));
    const query = memberSearch.trim().toLowerCase();
    return members.filter((member) => {
      if (assignedIds.has(member.id)) return false;
      if (!query) return true;
      return (
        member.user.username.toLowerCase().includes(query) ||
        member.user.handle.toLowerCase().includes(query)
      );
    });
  }, [members, memberSearch, roleMembers]);

  if (loading && roles.length === 0) {
    return <p className="text-sm text-muted">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-3">
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:min-h-[420px]">
        <div className="lg:w-56 shrink-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {t("communities.roles.listTitle")}
            </p>
            {canManage ? (
              <Button size="sm" onClick={() => void handleCreateRole()} disabled={saving}>
                {t("communities.roles.create")}
              </Button>
            ) : null}
          </div>
          <ul className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border p-1 lg:max-h-none">
            {roles.map((role, index) => (
              <li key={role.id}>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-2 text-left text-sm ${
                      selectedRoleId === role.id
                        ? "bg-accent-soft text-foreground"
                        : "hover:bg-surface-hover text-muted"
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <span className="truncate">{role.name}</span>
                  </button>
                  {canManage ? (
                    <div className="flex shrink-0 flex-col gap-0.5 sm:hidden">
                      <button
                        type="button"
                        className="rounded px-1 text-[10px] text-muted hover:bg-surface-hover"
                        disabled={index === 0 || saving}
                        onClick={() => void handleMoveRole(role.id, "up")}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="rounded px-1 text-[10px] text-muted hover:bg-surface-hover"
                        disabled={index === roles.length - 1 || saving}
                        onClick={() => void handleMoveRole(role.id, "down")}
                      >
                        ↓
                      </button>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 flex-1 rounded-xl border border-border bg-surface/30 p-3">
          {!selectedRole || !draft ? (
            <p className="text-sm text-muted">{t("communities.roles.selectRole")}</p>
          ) : (
            <>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <RolePreview role={draft} />
                {canManage && !selectedRole.isDefault ? (
                  <Button variant="secondary" size="sm" onClick={() => void handleDeleteRole()} disabled={saving}>
                    {t("communities.roles.delete")}
                  </Button>
                ) : null}
              </div>

              <div className="mb-3 flex flex-wrap gap-1 border-b border-border pb-2">
                {(["appearance", "permissions", "members"] as RoleEditorTab[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setEditorTab(item)}
                    className={`rounded-lg px-3 py-1.5 text-xs ${
                      editorTab === item
                        ? "bg-accent-soft font-medium text-foreground"
                        : "text-muted hover:bg-surface-hover"
                    }`}
                  >
                    {t(`communities.roles.tabs.${item}`)}
                  </button>
                ))}
              </div>

              {editorTab === "appearance" && (
                <div className="space-y-3">
                  <Input
                    label={t("communities.roles.name")}
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    disabled={!canManage || selectedRole.isOwnerRole}
                  />
                  <label className="block space-y-1.5">
                    <span className="text-sm text-muted">{t("communities.roles.color")}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={draft.color}
                        disabled={!canManage}
                        onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                        className="h-10 w-14 cursor-pointer rounded border border-border bg-input"
                      />
                      <input
                        type="text"
                        value={draft.color}
                        disabled={!canManage}
                        onChange={(e) => setDraft({ ...draft, color: e.target.value })}
                        className="flex-1 rounded-xl border border-border bg-input px-3 py-2 text-sm"
                      />
                    </div>
                  </label>
                  <Input
                    label={t("communities.roles.iconUrl")}
                    value={draft.iconUrl}
                    onChange={(e) => setDraft({ ...draft, iconUrl: e.target.value })}
                    disabled={!canManage}
                    placeholder="https://"
                  />
                  <label className="flex items-center justify-between gap-3 rounded-lg px-1 py-1">
                    <span className="text-sm">{t("communities.roles.hoist")}</span>
                    <input
                      type="checkbox"
                      checked={draft.hoist}
                      disabled={!canManage}
                      onChange={(e) => setDraft({ ...draft, hoist: e.target.checked })}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3 rounded-lg px-1 py-1">
                    <span className="text-sm">{t("communities.roles.mentionable")}</span>
                    <input
                      type="checkbox"
                      checked={draft.mentionable}
                      disabled={!canManage}
                      onChange={(e) => setDraft({ ...draft, mentionable: e.target.checked })}
                    />
                  </label>
                </div>
              )}

              {editorTab === "permissions" && (
                <div className="space-y-3">
                  <Input
                    label={t("communities.roles.permissionSearch")}
                    value={permissionSearch}
                    onChange={(e) => setPermissionSearch(e.target.value)}
                    placeholder={t("communities.roles.permissionSearchPlaceholder")}
                  />
                  <div className="space-y-2">
                    {filteredCategories.map((category) => {
                      const perms = PERMISSION_CATEGORIES[category].filter((perm) => {
                        if (!permissionSearch.trim()) return true;
                        const label = t(
                          `communities.rolePermissions.${perm.replace(/\./g, "_")}`,
                        ).toLowerCase();
                        return (
                          label.includes(permissionSearch.toLowerCase()) ||
                          perm.includes(permissionSearch.toLowerCase())
                        );
                      });
                      if (perms.length === 0) return null;
                      const expanded = expandedCategories[category] ?? false;
                      return (
                        <div key={category} className="rounded-xl border border-border">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium"
                            onClick={() =>
                              setExpandedCategories((prev) => ({
                                ...prev,
                                [category]: !expanded,
                              }))
                            }
                          >
                            {t(`communities.roles.categories.${category}`)}
                            <span className="text-muted">{expanded ? "−" : "+"}</span>
                          </button>
                          {expanded ? (
                            <div className="border-t border-border px-1 py-1">
                              {perms.map((perm) => (
                                <PermissionSwitch
                                  key={perm}
                                  permission={perm}
                                  checked={Boolean(draft.permissions[perm])}
                                  disabled={!canManage || (selectedRole.isOwnerRole && CRITICAL_PERMISSIONS.has(perm))}
                                  onChange={(value) => togglePermission(perm, value)}
                                />
                              ))}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {editorTab === "members" && (
                <div className="space-y-3">
                  <Input
                    label={t("communities.roles.memberSearch")}
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                  />
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      {t("communities.roles.assignedMembers")}
                    </p>
                    <ul className="space-y-1">
                      {roleMembers.map((item) => (
                        <li
                          key={item.assignmentId}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border px-2 py-1.5"
                        >
                          <span className="truncate text-sm">{item.user.username}</span>
                          {canManage && !selectedRole.isOwnerRole ? (
                            <button
                              type="button"
                              className="text-xs text-red-300 hover:underline"
                              disabled={saving}
                              onClick={() => void handleRemoveMember(item.memberId)}
                            >
                              {t("communities.roles.removeMember")}
                            </button>
                          ) : null}
                        </li>
                      ))}
                      {roleMembers.length === 0 ? (
                        <li className="text-sm text-muted">{t("communities.roles.noMembers")}</li>
                      ) : null}
                    </ul>
                  </div>
                  {canManage && !selectedRole.isOwnerRole ? (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                        {t("communities.roles.addMember")}
                      </p>
                      <ul className="max-h-40 space-y-1 overflow-y-auto">
                        {assignableMembers.map((member) => (
                          <li key={member.id}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between rounded-lg border border-border px-2 py-1.5 text-left text-sm hover:bg-surface-hover"
                              disabled={saving}
                              onClick={() => void handleAssignMember(member.id)}
                            >
                              {member.user.username}
                              <span className="text-xs text-accent">{t("communities.roles.add")}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}

              {canManage ? (
                <div className="mt-4 border-t border-border pt-3">
                  <Button onClick={() => void handleSaveRole()} disabled={saving}>
                    {saving ? t("common.loading") : t("communities.roles.save")}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
