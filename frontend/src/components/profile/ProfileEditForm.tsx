"use client";

import { useEffect, useState } from "react";
import { AvatarUploader } from "@/components/profile/AvatarUploader";
import { ProfileInterestEditor } from "@/components/profile/ProfileInterestEditor";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, updateMyProfile, type AuthUser } from "@/lib/api";
import { updateStoredUser } from "@/lib/auth";
import type { UpdateProfileInput } from "@/types/user";

export interface ProfileEditFormValues {
  username: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bio: string | null;
  statusMessage: string | null;
  profileInterests: string[];
}

interface ProfileEditFormProps {
  initial: ProfileEditFormValues;
  onSaved: (user: AuthUser) => void;
  resetKey?: string;
}

export function ProfileEditForm({
  initial,
  onSaved,
  resetKey,
}: ProfileEditFormProps) {
  const { t } = useLanguage();
  const [username, setUsername] = useState(initial.username);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatarUrl);
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [statusMessage, setStatusMessage] = useState(initial.statusMessage ?? "");
  const [profileInterests, setProfileInterests] = useState(initial.profileInterests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success } = useToast();

  useEffect(() => {
    setUsername(initial.username);
    setAvatarUrl(initial.avatarUrl);
    setBannerUrl(initial.bannerUrl ?? "");
    setBio(initial.bio ?? "");
    setStatusMessage(initial.statusMessage ?? "");
    setProfileInterests(initial.profileInterests);
    setError(null);
  }, [initial, resetKey]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const payload: UpdateProfileInput = {
      username,
      avatarUrl,
      bannerUrl: bannerUrl.trim() || null,
      bio: bio.trim() || null,
      statusMessage: statusMessage.trim() || null,
      profileInterests,
    };

    try {
      const { user } = await updateMyProfile(payload);
      updateStoredUser(user);
      onSaved(user);
      success(t("profile.updated"));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("profile.saveFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AvatarUploader
        username={username}
        value={avatarUrl}
        onChange={setAvatarUrl}
        disabled={loading}
      />

      <Input
        label={t("profile.username")}
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        maxLength={40}
      />

      <Input
        label={t("profile.bannerUrl")}
        value={bannerUrl}
        onChange={(event) => setBannerUrl(event.target.value)}
        placeholder="https://..."
      />

      <label className="block space-y-1.5">
        <span className="text-sm text-muted">{t("profile.bio")}</span>
        <textarea
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          maxLength={240}
          rows={3}
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)]"
        />
      </label>

      <Input
        label={t("profile.statusMessage")}
        value={statusMessage}
        onChange={(event) => setStatusMessage(event.target.value)}
        maxLength={80}
        placeholder={t("profile.statusPlaceholderExample")}
      />

      <div>
        <p className="mb-2 text-sm text-muted">{t("profile.interests")}</p>
        <ProfileInterestEditor
          interests={profileInterests}
          onChange={setProfileInterests}
          disabled={loading}
        />
      </div>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? t("common.saving") : t("profile.saveChanges")}
      </Button>
    </form>
  );
}
