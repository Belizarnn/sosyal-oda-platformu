"use client";

import { useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, updateMyProfile, type AuthUser } from "@/lib/api";
import { updateStoredUser } from "@/lib/auth";
import { compressImageFile } from "@/lib/imageUpload";
import { cn } from "@/lib/cn";

interface ProfileAvatarEditorProps {
  username: string;
  avatarUrl: string | null;
  onUpdated: (user: AuthUser) => void;
  className?: string;
}

export function ProfileAvatarEditor({
  username,
  avatarUrl,
  onUpdated,
  className,
}: ProfileAvatarEditorProps) {
  const { t } = useLanguage();
  const { success, error: toastError } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setLoading(true);

    try {
      const dataUrl = await compressImageFile(file);
      const { user } = await updateMyProfile({ avatarUrl: dataUrl });
      updateStoredUser(user);
      onUpdated(user);
      success(t("profile.photoUpdated"));
    } catch (err) {
      if (err instanceof ApiError) {
        toastError(err.message);
        return;
      }

      const code = err instanceof Error ? err.message : "unknown";

      if (code === "invalid-type") {
        toastError(t("profile.photoInvalidType"));
      } else if (code === "too-large") {
        toastError(t("profile.photoTooLarge"));
      } else {
        toastError(t("profile.photoUploadFailed"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("group relative inline-flex", className)}>
      <Avatar
        name={username}
        src={avatarUrl}
        size="xl"
        className={cn("ring-4 ring-ring-offset", loading && "opacity-70")}
      />

      <button
        type="button"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full",
          "bg-black/0 text-white transition group-hover:bg-black/45",
          loading && "bg-black/45",
        )}
        aria-label={t("profile.changePhoto")}
      >
        <span className="opacity-0 transition group-hover:opacity-100">
          {loading ? "..." : t("profile.changePhotoShort")}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => void handleFileChange(event)}
      />
    </div>
  );
}
