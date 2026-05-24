"use client";

import Link from "next/link";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";
import { PolicyPageLayout } from "@/components/policy/PolicyPageLayout";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";

const SECTION_KEYS = [
  "policy.beta.version",
  "policy.beta.bugs",
  "policy.beta.feedback",
  "policy.beta.changes",
];

export function BetaPageContent() {
  const { t } = useLanguage();

  return (
    <PolicyPageLayout
      titleKey="policy.beta.title"
      subtitleKey="policy.beta.subtitle"
      disclaimerKey="policy.disclaimer"
      sectionKeys={SECTION_KEYS}
    >
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">{t("policy.beta.feedbackActionTitle")}</h2>
        <p className="mt-3 text-sm text-muted">{t("policy.beta.feedbackActionDesc")}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <FeedbackButton variant="inline" />
          <Button href="/register" variant="secondary">
            {t("footer.register")}
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted">
          {t("policy.beta.registerNote")}{" "}
          <Link href="/register" className="text-accent hover:underline">
            {t("footer.register")}
          </Link>
        </p>
      </section>
    </PolicyPageLayout>
  );
}
