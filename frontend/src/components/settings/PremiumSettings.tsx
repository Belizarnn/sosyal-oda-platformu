"use client";

import { PremiumStatusPanel } from "@/components/premium/PremiumStatusPanel";
import type { AuthUser } from "@/lib/api";

interface PremiumSettingsProps {
  user: AuthUser;
  onUserUpdated: (user: AuthUser) => void;
}

export function PremiumSettings({ user, onUserUpdated }: PremiumSettingsProps) {
  return <PremiumStatusPanel user={user} onUserUpdated={onUserUpdated} />;
}
