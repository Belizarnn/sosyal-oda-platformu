"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountSettings } from "@/components/settings/AccountSettings";
import { DangerZone } from "@/components/settings/DangerZone";
import { LanguageSettings } from "@/components/settings/LanguageSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { PremiumSettings } from "@/components/settings/PremiumSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { updateStoredUser, type AuthUser } from "@/lib/auth";
import type { NotificationPreferences, SettingsSection } from "@/types/settings";

function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse space-y-6">
      <div className="h-10 w-48 rounded-xl bg-surface" />
      <div className="h-64 rounded-2xl bg-surface" />
    </div>
  );
}

export function SettingsView() {
  const router = useRouter();
  const { user, loading, setUser } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  function handleUserUpdated(updatedUser: AuthUser) {
    setUser(updatedUser);
    updateStoredUser(updatedUser);
  }

  function handlePreferencesUpdated(preferences: NotificationPreferences) {
    if (!user) {
      return;
    }

    const updatedUser = { ...user, ...preferences };
    setUser(updatedUser);
    updateStoredUser(updatedUser);
  }

  if (loading) {
    return <SettingsSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("settings.subtitle")}</p>
      </div>

      <SettingsLayout
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      >
        {activeSection === "account" ? <AccountSettings user={user} /> : null}
        {activeSection === "profile" ? (
          <ProfileSettings user={user} onUserUpdated={handleUserUpdated} />
        ) : null}
        {activeSection === "premium" ? (
          <PremiumSettings user={user} onUserUpdated={handleUserUpdated} />
        ) : null}
        {activeSection === "notifications" ? (
          <NotificationSettings
            user={user}
            onPreferencesUpdated={handlePreferencesUpdated}
          />
        ) : null}
        {activeSection === "security" ? <SecuritySettings /> : null}
        {activeSection === "language" ? <LanguageSettings /> : null}
        {activeSection === "danger" ? <DangerZone /> : null}
      </SettingsLayout>
    </div>
  );
}
