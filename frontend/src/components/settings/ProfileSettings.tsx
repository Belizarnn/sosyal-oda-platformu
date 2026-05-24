"use client";

import { Card } from "@/components/ui/Card";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AuthUser } from "@/lib/api";

interface ProfileSettingsProps {
  user: AuthUser;
  onUserUpdated: (user: AuthUser) => void;
}

export function ProfileSettings({ user, onUserUpdated }: ProfileSettingsProps) {
  const { t } = useLanguage();

  return (
    <Card glow className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t("settings.profile.title")}</h2>
        <p className="mt-1 text-sm text-muted">{t("settings.profile.avatarNote")}</p>
      </div>

      <ProfileEditForm
        initial={{
          username: user.username,
          avatarUrl: user.avatarUrl,
          bannerUrl: user.bannerUrl,
          bio: user.bio,
          statusMessage: user.statusMessage,
          profileInterests: user.profileInterests,
        }}
        resetKey={user.updatedAt}
        onSaved={onUserUpdated}
      />
    </Card>
  );
}
