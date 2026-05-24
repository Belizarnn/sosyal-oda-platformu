"use client";

import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AuthUser } from "@/lib/api";
import type { UserProfile } from "@/types/user";

interface EditProfileModalProps {
  open: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSaved: (user: AuthUser, profile: UserProfile) => void;
}

export function EditProfileModal({
  open,
  profile,
  onClose,
  onSaved,
}: EditProfileModalProps) {
  const { t } = useLanguage();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-dropdown p-6 shadow-[0_0_40px_var(--glow)]">
        <h2 className="text-lg font-semibold">{t("profile.editTitle")}</h2>
        <p className="mt-1 text-sm text-muted">
          {t("settings.profile.avatarNote")}
        </p>

        <div className="mt-6">
          <ProfileEditForm
            initial={{
              username: profile.username,
              avatarUrl: profile.avatarUrl,
              bannerUrl: profile.bannerUrl,
              bio: profile.bio,
              statusMessage: profile.statusMessage,
              profileInterests: profile.profileInterests,
            }}
            resetKey={profile.id}
            onSaved={(user) => {
              onSaved(user, {
                ...profile,
                username: user.username,
                avatarUrl: user.avatarUrl,
                bannerUrl: user.bannerUrl,
                bio: user.bio,
                statusMessage: user.statusMessage,
                profileInterests: user.profileInterests,
              });
              onClose();
            }}
          />
        </div>

        <div className="mt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="w-full">
            {t("common.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
