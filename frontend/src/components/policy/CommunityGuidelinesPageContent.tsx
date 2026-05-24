"use client";

import { PolicyPageLayout } from "@/components/policy/PolicyPageLayout";

const SECTION_KEYS = [
  "policy.community.respect",
  "policy.community.harassment",
  "policy.community.spam",
  "policy.community.content",
  "policy.community.moderation",
];

export function CommunityGuidelinesPageContent() {
  return (
    <PolicyPageLayout
      titleKey="policy.community.title"
      subtitleKey="policy.community.subtitle"
      disclaimerKey="policy.disclaimer"
      sectionKeys={SECTION_KEYS}
    />
  );
}
