"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { parseYouTubeVideoId } from "@/lib/youtube";

interface VideoUrlFormProps {
  disabled?: boolean;
  loading?: boolean;
  onSubmit: (videoUrl: string) => Promise<void>;
}

export function VideoUrlForm({
  disabled = false,
  loading = false,
  onSubmit,
}: VideoUrlFormProps) {
  const { t } = useLanguage();
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!parseYouTubeVideoId(videoUrl)) {
      setError(t("watch.invalidUrl"));
      return;
    }

    try {
      await onSubmit(videoUrl.trim());
      setVideoUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("watch.videoStartFailed"));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="url"
        value={videoUrl}
        onChange={(event) => setVideoUrl(event.target.value)}
        disabled={disabled || loading}
        placeholder="https://www.youtube.com/watch?v=..."
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted/70 outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)]"
      />

      {error ? <p className="text-xs text-red-300">{error}</p> : null}

      <Button type="submit" disabled={disabled || loading} className="w-full">
        {loading ? t("common.loading") : t("watch.startVideo")}
      </Button>
    </form>
  );
}
