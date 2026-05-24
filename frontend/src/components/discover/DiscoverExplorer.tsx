"use client";

import { useCallback, useEffect, useState } from "react";
import { RoomCard } from "@/components/rooms/RoomCard";
import { RoomCategoryPill } from "@/components/rooms/RoomCategoryPill";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryLabel, getDiscoverSortLabel } from "@/i18n/utils";
import { ApiError, getDiscoverRooms } from "@/lib/api";
import type { DiscoverRoom, DiscoverSort } from "@/types/discover";
import { DISCOVER_CATEGORY_OPTIONS, DISCOVER_SORT_OPTIONS } from "@/types/discover";
import type { DiscoverCategoryFilter } from "@/types/discover";
import type { RoomCategory } from "@/types/room";
import { discoverRoomToListItem } from "@/types/room";

function RoomGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-56 animate-pulse rounded-2xl bg-surface" />
      ))}
    </div>
  );
}

function TrendingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="h-24 animate-pulse rounded-2xl bg-surface" />
      ))}
    </div>
  );
}

export function DiscoverExplorer() {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<DiscoverCategoryFilter>("ALL");
  const [sort, setSort] = useState<DiscoverSort>("trending");

  const [trendingRooms, setTrendingRooms] = useState<DiscoverRoom[]>([]);
  const [recommendedRooms, setRecommendedRooms] = useState<DiscoverRoom[]>([]);
  const [allRooms, setAllRooms] = useState<DiscoverRoom[]>([]);
  const [roomsNextCursor, setRoomsNextCursor] = useState<string | null>(null);
  const [loadingMoreRooms, setLoadingMoreRooms] = useState(false);

  const [highlightsLoading, setHighlightsLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadHighlights = useCallback(async () => {
    setHighlightsLoading(true);

    try {
      const filters = {
        search: debouncedSearch || undefined,
        category: category === "ALL" ? undefined : (category as RoomCategory),
      };

      const [trendingResponse, recommendedResponse] = await Promise.all([
        getDiscoverRooms({
          ...filters,
          sort: "trending",
          limit: 4,
        }),
        getDiscoverRooms({
          ...filters,
          sort: "recommended",
          limit: 6,
        }),
      ]);

      setTrendingRooms(trendingResponse.rooms);
      setRecommendedRooms(recommendedResponse.rooms);
    } catch {
      setTrendingRooms([]);
      setRecommendedRooms([]);
    } finally {
      setHighlightsLoading(false);
    }
  }, [category, debouncedSearch]);

  const loadRooms = useCallback(async () => {
    setRoomsLoading(true);
    setError(null);

    try {
      const response = await getDiscoverRooms({
        search: debouncedSearch || undefined,
        category: category === "ALL" ? undefined : (category as RoomCategory),
        sort,
        limit: 20,
      });
      setAllRooms(response.rooms);
      setRoomsNextCursor(response.nextCursor ?? null);
    } catch (err) {
      setAllRooms([]);
      setError(
        err instanceof ApiError ? err.message : t("discover.loadError"),
      );
    } finally {
      setRoomsLoading(false);
    }
  }, [category, debouncedSearch, sort, t]);

  async function handleLoadMoreRooms() {
    if (!roomsNextCursor || loadingMoreRooms) {
      return;
    }

    setLoadingMoreRooms(true);

    try {
      const response = await getDiscoverRooms({
        search: debouncedSearch || undefined,
        category: category === "ALL" ? undefined : (category as RoomCategory),
        sort,
        limit: 20,
        cursor: roomsNextCursor,
      });
      setAllRooms((current) => [...current, ...response.rooms]);
      setRoomsNextCursor(response.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("discover.loadError"));
    } finally {
      setLoadingMoreRooms(false);
    }
  }

  useEffect(() => {
    void loadHighlights();
  }, [loadHighlights]);

  useEffect(() => {
    void loadRooms();
  }, [loadRooms]);

  function clearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setCategory("ALL");
    setSort("trending");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section>
        <h1 className="text-2xl font-semibold sm:text-3xl">{t("discover.title")}</h1>
        <p className="mt-1 text-muted">{t("discover.subtitleLong")}</p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder={t("discover.searchPlaceholder")}
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            className="flex-1"
          />

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as DiscoverSort)}
            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-accent/50 focus:ring-2 focus:ring-[var(--accent-ring)]"
            aria-label={t("discover.sortLabel")}
          >
            {DISCOVER_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {getDiscoverSortLabel(option.value, t)}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t("discover.trendingRooms")}</h2>
        {highlightsLoading ? (
          <TrendingSkeleton />
        ) : trendingRooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {trendingRooms.map((room) => (
              <Card
                key={room.id}
                className="flex items-center gap-4 transition hover:border-accent/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{room.name}</p>
                  <p className="text-sm text-muted">
                    {t("discover.activeMembers", { count: room.currentUserCount })} · @
                    {room.owner.handle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-accent">
                    {room.currentUserCount}
                  </p>
                  <p className="text-xs text-muted">{t("discover.active")}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("discover.noTrending")}</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">{t("discover.categories")}</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DISCOVER_CATEGORY_OPTIONS.map((option) => (
            <RoomCategoryPill
              key={option.value}
              label={getCategoryLabel(option.value, t)}
              active={category === option.value}
              onClick={() => setCategory(option.value)}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">{t("discover.recommendedRooms")}</h2>
        {highlightsLoading ? (
          <RoomGridSkeleton count={3} />
        ) : recommendedRooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedRooms.map((room) => (
              <RoomCard key={room.id} room={discoverRoomToListItem(room)} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("discover.noRecommended")}</p>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{t("discover.allPublicRooms")}</h2>
          {!roomsLoading && allRooms.length > 0 ? (
            <span className="text-sm text-muted">
              {t("discover.roomCount", { count: allRooms.length })}
            </span>
          ) : null}
        </div>

        {error ? (
          <ErrorState
            title={t("states.error.roomsLoadFailed")}
            description={error}
            onRetry={() => void loadRooms()}
          />
        ) : null}

        {roomsLoading ? (
          <LoadingState label={t("states.loading.rooms")} rows={3} />
        ) : null}

        {!roomsLoading && !error && allRooms.length === 0 ? (
          <EmptyState
            icon="✦"
            title={t("states.empty.discover")}
            description={t("discover.emptyFilterDesc")}
            actionLabel={t("discover.clearFilters")}
            onAction={clearFilters}
          />
        ) : null}

        {!roomsLoading && !error && allRooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allRooms.map((room) => (
              <RoomCard key={room.id} room={discoverRoomToListItem(room)} />
            ))}
          </div>
        ) : null}

        {!roomsLoading && !error && roomsNextCursor ? (
          <div className="mt-4 flex justify-center">
            <Button
              variant="secondary"
              disabled={loadingMoreRooms}
              onClick={() => void handleLoadMoreRooms()}
            >
              {loadingMoreRooms ? t("common.loading") : t("common.loadMore")}
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
