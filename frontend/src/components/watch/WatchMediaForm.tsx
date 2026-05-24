"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { parseYouTubeVideoId } from "@/lib/youtube";
import type { MediaProvider, SetWatchMediaInput } from "@/types/watch";

interface WatchMediaFormProps {
  provider: MediaProvider;
  loading?: boolean;
  disabled?: boolean;
  onSubmit: (data: SetWatchMediaInput) => Promise<void>;
}

function isEmbedProvider(provider: MediaProvider): boolean {
  return provider === "YOUTUBE" || provider === "TWITCH" || provider === "KICK";
}

export function WatchMediaForm({
  provider,
  loading,
  disabled,
  onSubmit,
}: WatchMediaFormProps) {
  const [url, setUrl] = useState("");
  const [externalTitle, setExternalTitle] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (isEmbedProvider(provider)) {
      if (!url.trim()) {
        setError("URL zorunlu.");
        return;
      }

      if (provider === "YOUTUBE" && !parseYouTubeVideoId(url)) {
        setError("Geçerli bir YouTube bağlantısı gir.");
        return;
      }
    } else {
      if (!externalTitle.trim()) {
        setError("İçerik adı zorunlu.");
        return;
      }
    }

    try {
      await onSubmit({
        provider,
        url: isEmbedProvider(provider) ? url.trim() : undefined,
        externalTitle: !isEmbedProvider(provider) ? externalTitle.trim() : undefined,
        externalUrl: !isEmbedProvider(provider) && externalUrl.trim()
          ? externalUrl.trim()
          : undefined,
      });
      setUrl("");
      setExternalTitle("");
      setExternalUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "İşlem başarısız.");
    }
  }

  if (isEmbedProvider(provider)) {
    const label =
      provider === "YOUTUBE"
        ? "YouTube linki"
        : provider === "TWITCH"
          ? "Twitch kanal linki"
          : "Kick kanal linki";

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
          {loading ? "Başlatılıyor..." : "Odaya Ekle"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-3">
      <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        Bu servis platform içinde oynatılamaz. Herkes kendi hesabında aynı içeriği açar.
      </p>

      <label className="block text-xs text-muted">
        İçerik adı
        <input
          type="text"
          value={externalTitle}
          onChange={(event) => setExternalTitle(event.target.value)}
          placeholder="Örn. Stranger Things S1E1"
          disabled={disabled || loading}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-xs text-muted">
        Harici link (opsiyonel)
        <input
          type="url"
          value={externalUrl}
          onChange={(event) => setExternalUrl(event.target.value)}
          placeholder="https://..."
          disabled={disabled || loading}
          className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
        />
      </label>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <Button type="submit" disabled={disabled || loading} className="w-full">
        {loading ? "Başlatılıyor..." : "Harici İzleme Odasını Başlat"}
      </Button>
    </form>
  );
}
