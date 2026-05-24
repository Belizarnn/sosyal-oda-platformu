"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { compressImageFile } from "@/lib/imageUpload";
import { cn } from "@/lib/cn";

interface AvatarUploaderProps {
  username: string;
  value: string | null;
  onChange: (avatarUrl: string | null) => void;
  disabled?: boolean;
  size?: "md" | "lg" | "xl";
  className?: string;
}

export function AvatarUploader({
  username,
  value,
  onChange,
  disabled = false,
  size = "xl",
  className,
}: AvatarUploaderProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const dataUrl = await compressImageFile(file);
      onChange(dataUrl);
    } catch (err) {
      const code = err instanceof Error ? err.message : "unknown";

      if (code === "invalid-type") {
        setError(t("profile.photoInvalidType"));
      } else if (code === "too-large") {
        setError(t("profile.photoTooLarge"));
      } else {
        setError(t("profile.photoUploadFailed"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar name={username} src={value} size={size} className="ring-4 ring-ring-offset" />
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-xs text-white">
              ...
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            disabled={disabled || loading}
            onClick={() => inputRef.current?.click()}
          >
            {value ? t("profile.changePhoto") : t("profile.uploadPhoto")}
          </Button>
          {value ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={disabled || loading}
              onClick={() => onChange(null)}
            >
              {t("profile.removePhoto")}
            </Button>
          ) : null}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />

      <p className="text-xs text-muted">{t("profile.photoHint")}</p>

      {error ? <p className="text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
