"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, createCommunity } from "@/lib/api";
import { findDefaultLandingChannel } from "@/lib/communityUi";
import type { CommunityVisibility } from "@/types/community";

const VISIBILITIES: CommunityVisibility[] = ["PUBLIC", "INVITE_ONLY", "PRIVATE"];

export function CreateCommunityForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createCommunity({ name: name.trim(), visibility });
      const landing = findDefaultLandingChannel(result.channels);
      if (landing) {
        router.push(`/communities/${result.community.id}/channels/${landing.id}`);
      } else {
        router.push(`/communities/${result.community.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("communities.createFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="mx-auto flex max-w-md flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <h1 className="text-xl font-semibold">{t("communities.create")}</h1>
        <p className="mt-1 text-sm text-muted">{t("communities.createSimpleDesc")}</p>
      </div>

      <Input
        label={t("communities.form.name")}
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={t("communities.form.namePlaceholder")}
        required
      />

      <fieldset className="space-y-2">
        <legend className="text-sm text-muted">{t("communities.form.visibility")}</legend>
        {VISIBILITIES.map((item) => (
          <label
            key={item}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/50 px-3 py-2.5 transition hover:border-accent/30"
          >
            <input
              type="radio"
              name="visibility"
              value={item}
              checked={visibility === item}
              onChange={() => setVisibility(item)}
              className="mt-1"
            />
            <span>
              <span className="block text-sm font-medium">
                {t(`communities.visibility.${item.toLowerCase()}`)}
              </span>
              <span className="block text-xs text-muted">
                {t(`communities.visibilityHint.${item.toLowerCase()}`)}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || name.trim().length < 3} className="flex-1">
          {loading ? t("common.loading") : t("communities.createSubmit")}
        </Button>
        <Button type="button" variant="secondary" href="/communities">
          {t("common.cancel")}
        </Button>
      </div>
    </form>
  );
}
