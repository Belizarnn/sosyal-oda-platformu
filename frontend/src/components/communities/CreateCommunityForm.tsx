"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, createCommunity } from "@/lib/api";
import type { CommunityCategory, CommunityVisibility } from "@/types/community";

const CATEGORIES: CommunityCategory[] = [
  "GENERAL",
  "FILM",
  "SERIES",
  "ANIME",
  "GAME",
  "EDUCATION",
  "FRIENDS",
];

const VISIBILITIES: CommunityVisibility[] = ["PUBLIC", "INVITE_ONLY", "PRIVATE"];

export function CreateCommunityForm() {
  const router = useRouter();
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [category, setCategory] = useState<CommunityCategory>("GENERAL");
  const [visibility, setVisibility] = useState<CommunityVisibility>("PUBLIC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createCommunity({
        name,
        description: description || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        category,
        visibility,
      });
      const firstChannel = result.channels[0];
      if (firstChannel) {
        router.push(`/communities/${result.community.id}/channels/${firstChannel.id}`);
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
    <form className="mx-auto flex max-w-lg flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <h1 className="text-xl font-semibold">{t("communities.create")}</h1>
        <p className="mt-1 text-sm text-muted">{t("communities.createDesc")}</p>
      </div>

      <Input
        label={t("communities.form.name")}
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <Input
        label={t("communities.form.avatarUrl")}
        value={avatarUrl}
        onChange={(event) => setAvatarUrl(event.target.value)}
        placeholder="https://"
      />

      <label className="block space-y-1.5">
        <span className="text-sm text-muted">{t("communities.form.description")}</span>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm outline-none focus:border-accent/50"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-muted">{t("communities.form.category")}</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as CommunityCategory)}
          className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm"
        >
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {t(`communities.categories.${item.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm text-muted">{t("communities.form.visibility")}</span>
        <select
          value={visibility}
          onChange={(event) => setVisibility(event.target.value as CommunityVisibility)}
          className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm"
        >
          {VISIBILITIES.map((item) => (
            <option key={item} value={item}>
              {t(`communities.visibility.${item.toLowerCase()}`)}
            </option>
          ))}
        </select>
      </label>

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
