"use client";

import { PolicyPageLayout } from "@/components/policy/PolicyPageLayout";

const SECTION_KEYS = [
  "policy.terms.usage",
  "policy.terms.account",
  "policy.terms.rules",
  "policy.terms.liability",
];

export function TermsPageContent() {
  return (
    <PolicyPageLayout
      titleKey="policy.terms.title"
      subtitleKey="policy.terms.subtitle"
      disclaimerKey="policy.disclaimer"
      sectionKeys={SECTION_KEYS}
    />
  );
}
