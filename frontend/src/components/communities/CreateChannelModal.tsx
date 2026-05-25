"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, createCommunityChannel } from "@/lib/api";
import type {
  ChannelType,
  ChannelVisibility,
  CommunityMemberRole,
} from "@/types/community";

const CHANNEL_TYPES: ChannelType[] = [
  "TEXT",
  "WATCH",
  "VOICE",
  "VIDEO",
  "ANNOUNCEMENT",
  "PRIVATE",
];

const ROLES: CommunityMemberRole[] = [
  "GUEST",
  "MEMBER",
  "MODERATOR",
  "ADMIN",
  "OWNER",
];

interface CreateChannelModalProps {
  communityId: string;
  open: boolean;
  onClose: () => void;
  onCreated: (channelId: string) => void;
}

export function CreateChannelModal({
  communityId,
  open,
  onClose,
  onCreated,
}: CreateChannelModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [type, setType] = useState<ChannelType>("TEXT");
  const [visibility, setVisibility] = useState<ChannelVisibility>("PUBLIC");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [minRoleSend, setMinRoleSend] = useState<CommunityMemberRole>("MEMBER");
  const [minRoleWatchStart, setMinRoleWatchStart] = useState<CommunityMemberRole>("MEMBER");
  const [minRoleWatchControl, setMinRoleWatchControl] =
    useState<CommunityMemberRole>("MODERATOR");
  const [minRoleVoice, setMinRoleVoice] = useState<CommunityMemberRole>("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await createCommunityChannel(communityId, {
        name: name.trim(),
        type,
        visibility,
        permissions: advancedOpen
          ? {
              minRoleSend,
              minRoleWatchStart,
              minRoleWatchControl,
              minRoleVoice,
              minRoleVideo: minRoleVoice,
            }
          : undefined,
      });
      setName("");
      setType("TEXT");
      setVisibility("PUBLIC");
      setAdvancedOpen(false);
      onCreated(response.channel.id);
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.createChannelFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-[var(--overlay)]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-dropdown p-5">
        <h2 className="text-lg font-semibold">{t("communities.createChannel")}</h2>
        <p className="mt-1 text-xs text-muted">{t("communities.createChannelDesc")}</p>

        <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
          <Input
            label={t("communities.form.channelName")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t("communities.form.channelNamePlaceholder")}
            required
          />

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">{t("communities.form.channelType")}</span>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ChannelType)}
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm"
            >
              {CHANNEL_TYPES.map((item) => (
                <option key={item} value={item}>
                  {t(`communities.channelTypes.${item.toLowerCase()}`)}
                </option>
              ))}
            </select>
          </label>

          <fieldset className="space-y-2">
            <legend className="text-sm text-muted">{t("communities.form.channelPrivacy")}</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="channelPrivacy"
                checked={visibility === "PUBLIC"}
                onChange={() => setVisibility("PUBLIC")}
              />
              {t("communities.channelPrivacy.everyone")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="channelPrivacy"
                checked={visibility === "PRIVATE"}
                onChange={() => setVisibility("PRIVATE")}
              />
              {t("communities.channelPrivacy.selectedRoles")}
            </label>
          </fieldset>

          <button
            type="button"
            className="text-xs text-accent hover:underline"
            onClick={() => setAdvancedOpen((value) => !value)}
          >
            {advancedOpen
              ? t("communities.form.hideAdvanced")
              : t("communities.form.showAdvanced")}
          </button>

          {advancedOpen ? (
            <div className="space-y-2 rounded-xl border border-border bg-surface/40 p-3">
              <PermissionSelect
                label={t("communities.permissions.message_send")}
                value={minRoleSend}
                onChange={setMinRoleSend}
                roles={ROLES}
                t={t}
              />
              <PermissionSelect
                label={t("communities.permissions.watch_start")}
                value={minRoleWatchStart}
                onChange={setMinRoleWatchStart}
                roles={ROLES}
                t={t}
              />
              <PermissionSelect
                label={t("communities.permissions.watch_control")}
                value={minRoleWatchControl}
                onChange={setMinRoleWatchControl}
                roles={ROLES}
                t={t}
              />
              <PermissionSelect
                label={t("communities.permissions.voice_join")}
                value={minRoleVoice}
                onChange={setMinRoleVoice}
                roles={ROLES}
                t={t}
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || name.trim().length < 2} className="flex-1">
              {loading ? t("common.loading") : t("communities.createChannelSubmit")}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PermissionSelect({
  label,
  value,
  onChange,
  roles,
  t,
}: {
  label: string;
  value: CommunityMemberRole;
  onChange: (role: CommunityMemberRole) => void;
  roles: CommunityMemberRole[];
  t: (key: string) => string;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as CommunityMemberRole)}
        className="w-full rounded-lg border border-border bg-input px-3 py-2 text-xs"
      >
        {roles.map((role) => (
          <option key={role} value={role}>
            {t(`communities.roles.${role.toLowerCase()}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
