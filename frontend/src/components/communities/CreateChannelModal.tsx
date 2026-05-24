"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, createCommunityChannel } from "@/lib/api";
import type { ChannelType, ChannelVisibility } from "@/types/community";

const CHANNEL_TYPES: ChannelType[] = [
  "TEXT",
  "VOICE",
  "VIDEO",
  "WATCH",
  "ANNOUNCEMENT",
  "PRIVATE",
];

interface CreateChannelModalProps {
  communityId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateChannelModal({
  communityId,
  open,
  onClose,
  onCreated,
}: CreateChannelModalProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ChannelType>("TEXT");
  const [visibility, setVisibility] = useState<ChannelVisibility>("PUBLIC");
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
      await createCommunityChannel(communityId, {
        name,
        description: description || undefined,
        type,
        visibility,
      });
      setName("");
      setDescription("");
      onCreated();
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

        <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
          <Input
            label={t("communities.form.channelName")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">{t("communities.form.description")}</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm"
            />
          </label>

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

          <label className="block space-y-1.5">
            <span className="text-sm text-muted">{t("communities.form.channelVisibility")}</span>
            <select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as ChannelVisibility)}
              className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm"
            >
              <option value="PUBLIC">{t("communities.channelVisibility.public")}</option>
              <option value="PRIVATE">{t("communities.channelVisibility.private")}</option>
            </select>
          </label>

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
