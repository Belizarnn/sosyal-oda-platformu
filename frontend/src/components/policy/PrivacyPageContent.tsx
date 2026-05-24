"use client";

import { PolicyPageLayout } from "@/components/policy/PolicyPageLayout";

const SECTION_KEYS = [
  "policy.privacy.collected",
  "policy.privacy.messages",
  "policy.privacy.analytics",
  "policy.privacy.storage",
  "policy.privacy.contact",
];

export function PrivacyPageContent() {
  return (
    <PolicyPageLayout
      titleKey="policy.privacy.title"
      subtitleKey="policy.privacy.subtitle"
      disclaimerKey="policy.disclaimer"
      sectionKeys={SECTION_KEYS}
    />
  );
}
