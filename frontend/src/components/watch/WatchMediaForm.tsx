"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { isAssistedExternalProvider } from "@/lib/assistedExternalSync";
import { parseYouTubeVideoId } from "@/lib/youtube";
import type { MediaProvider, SetWatchMediaInput } from "@/types/watch";
import { getProviderLabel } from "@/types/watch";

interface WatchMediaFormProps {
  provider: MediaProvider;
  loading?: boolean;
  disabled?: boolean;
  onSubmit: (data: SetWatchMediaInput) => Promise<void>;
}

function isEmbedProvider(provider: MediaProvider): boolean {
  return provider === "YOUTUBE" || provider === "TWITCH" || provider === "KICK";
}

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function WatchMediaForm({
  provider,
  loading,
  disabled,
  onSubmit,
}: WatchMediaFormProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState("");
  const [externalTitle, setExternalTitle] = useState("");
  const [externalSeason, setExternalSeason] = useState("");
  const [externalEpisode, setExternalEpisode] = useState("");
  const [externalStartOffsetMinutes, setExternalStartOffsetMinutes] = useState("");
  const [externalNotes, setExternalNotes] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (isEmbedProvider(provider)) {
      if (!url.trim()) {
        setError(t("watch.assisted.urlRequired"));
        return;
      }

      if (provider === "YOUTUBE" && !parseYouTubeVideoId(url)) {
        setError(t("watch.invalidUrl"));
        return;
      }
    } else if (isAssistedExternalProvider(provider)) {
      if (!externalTitle.trim()) {
        setError(t("watch.assisted.titleRequired"));
        return;
      }
    }

    try {
      await onSubmit({
        provider,
        url: isEmbedProvider(provider) ? url.trim() : undefined,
        externalTitle: isAssistedExternalProvider(provider)
          ? externalTitle.trim()
          : undefined,
        externalSeason: isAssistedExternalProvider(provider)
          ? parseOptionalInt(externalSeason)
          : undefined,
        externalEpisode: isAssistedExternalProvider(provider)
          ? parseOptionalInt(externalEpisode)
          : undefined,
        externalStartOffsetMinutes: isAssistedExternalProvider(provider)
          ? parseOptionalInt(externalStartOffsetMinutes)
          : undefined,
        externalNotes: isAssistedExternalProvider(provider) && externalNotes.trim()
          ? externalNotes.trim()
          : undefined,
        externalUrl: isAssistedExternalProvider(provider) && externalUrl.trim()
          ? externalUrl.trim()
          : undefined,
      });
      setUrl("");
      setExternalTitle("");
      setExternalSeason("");
      setExternalEpisode("");
      setExternalStartOffsetMinutes("");
      setExternalNotes("");
      setExternalUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("notifications.actionFailed"));
    }
  }

  if (isEmbedProvider(provider)) {
    const label =
      provider === "YOUTUBE"
        ? t("watch.assisted.youtubeUrl")
        : provider === "TWITCH"
          ? t("watch.assisted.twitchUrl")
          : t("watch.assisted.kickUrl");

    return (
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
        <label className="block text-xs text-muted">
          {label}
          <input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={
              provider === "YOUTUBE"
                ? "https://www.youtube.com/watch?v=..."
                : provider === "TWITCH"
                  ? "https://www.twitch.tv/kanal"
                  : "https://kick.com/kanal"
            }
            disabled={disabled || loading}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
        <Button type="submit" disabled={disabled || loading} className="w-full">
          {loading ? t("watch.assisted.starting") : t("watch.assisted.addToRoom")}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        {t("watch.assisted.formInfo", { platform: getProviderLabel(provider) })}
      </p>

      <label className="block text-xs text-muted">
        {t("watch.assisted.contentTitle")}
        <input
          type="text"
          value={externalTitle}
          onChange={(event) => setExternalTitle(event.target.value)}
          placeholder={t("watch.assisted.contentTitlePlaceholder")}
          disabled={disabled || loading}
          required
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-muted">
          {t("watch.assisted.season")}
          <input
            type="number"
            min={0}
            value={externalSeason}
            onChange={(event) => setExternalSeason(event.target.value)}
            placeholder="1"
            disabled={disabled || loading}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>

        <label className="block text-xs text-muted">
          {t("watch.assisted.episode")}
          <input
            type="number"
            min={0}
            value={externalEpisode}
            onChange={(event) => setExternalEpisode(event.target.value)}
            placeholder="1"
            disabled={disabled || loading}
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block text-xs text-muted">
        {t("watch.assisted.startMinutes")}
        <input
          type="number"
          min={0}
          value={externalStartOffsetMinutes}
          onChange={(event) => setExternalStartOffsetMinutes(event.target.value)}
          placeholder="0"
          disabled={disabled || loading}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-xs text-muted">
        {t("watch.assisted.notes")}
        <textarea
          value={externalNotes}
          onChange={(event) => setExternalNotes(event.target.value)}
          placeholder={t("watch.assisted.notesPlaceholder")}
          disabled={disabled || loading}
          rows={2}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-xs text-muted">
        {t("watch.assisted.optionalLink")}
        <input
          type="url"
          value={externalUrl}
          onChange={(event) => setExternalUrl(event.target.value)}
          placeholder={t("watch.assisted.optionalLinkPlaceholder")}
          disabled={disabled || loading}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <Button type="submit" disabled={disabled || loading} className="w-full">
        {loading ? t("watch.assisted.starting") : t("watch.assisted.startSession")}
      </Button>
    </form>
  );
}
