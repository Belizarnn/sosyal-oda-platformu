"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { ApiError, getCommunities } from "@/lib/api";
import type { CommunityListItem } from "@/types/community";

export function CommunityExplorer() {
  const router = useRouter();
  const { t } = useLanguage();
  const [communities, setCommunities] = useState<CommunityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await getCommunities({ search: search || undefined, limit: 30 });
        setCommunities(response.communities);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : t("states.error.loadFailed"));
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => void load(), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, t]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{t("communities.title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("communities.subtitle")}</p>
        </div>
        <Button href="/communities/create">{t("communities.create")}</Button>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={t("communities.searchPlaceholder")}
        aria-label={t("communities.searchPlaceholder")}
      />

      {error ? (
        <ErrorState
          title={t("states.error.loadFailed")}
          description={error}
          onRetry={() => window.location.reload()}
        />
      ) : null}

      {loading ? <LoadingState label={t("states.loading.default")} rows={3} /> : null}

      {!loading && communities.length === 0 ? (
        <EmptyState
          title={t("communities.emptyTitle")}
          description={t("communities.emptyDesc")}
          actionLabel={t("communities.create")}
          href="/communities/create"
        />
      ) : null}

      {!loading && communities.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {communities.map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              onOpen={() => router.push(`/communities/${community.id}`)}
            />
          ))}
        </div>
      ) : null}

      <p className="text-center text-sm text-muted">
        <Link href="/rooms" className="text-accent hover:underline">
          {t("communities.quickRoomsLink")}
        </Link>
      </p>
    </div>
  );
}
