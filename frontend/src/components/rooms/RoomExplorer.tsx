"use client";



import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";

import { CreateRoomModal } from "@/components/rooms/CreateRoomModal";

import { RoomCard } from "@/components/rooms/RoomCard";

import { RoomCategoryPill } from "@/components/rooms/RoomCategoryPill";

import { Button } from "@/components/ui/Button";

import { EmptyState } from "@/components/ui/EmptyState";

import { ErrorState } from "@/components/ui/ErrorState";

import { Input } from "@/components/ui/Input";

import { LoadingState } from "@/components/ui/LoadingState";

import { useLanguage } from "@/contexts/LanguageContext";

import { getCategoryLabel } from "@/i18n/utils";

import { ApiError, getRooms } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";

import { getToken } from "@/lib/auth";

import {

  ROOM_CATEGORY_OPTIONS,

  type RoomCategory,

  type RoomListItem,

} from "@/types/room";



const VALID_CATEGORIES = new Set<string>(ROOM_CATEGORY_OPTIONS.map((item) => item.value));



export function RoomExplorer() {

  const router = useRouter();

  const searchParams = useSearchParams();

  const { t } = useLanguage();

  const [rooms, setRooms] = useState<RoomListItem[]>([]);
  const [roomsNextCursor, setRoomsNextCursor] = useState<string | null>(null);
  const [loadingMoreRooms, setLoadingMoreRooms] = useState(false);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState<RoomCategory | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);



  useEffect(() => {

    const categoryParam = searchParams.get("category");

    if (categoryParam && VALID_CATEGORIES.has(categoryParam)) {

      setCategory(categoryParam as RoomCategory);

    }



    if (searchParams.get("create") === "1" || searchParams.get("action") === "create") {

      setModalOpen(true);

    }

  }, [searchParams]);



  const loadRooms = useCallback(async () => {

    setLoading(true);

    setError(null);



    try {

      const response = await getRooms({

        search: search.trim() || undefined,

        category: category ?? undefined,

        type: "PUBLIC",

        limit: 20,

      });

      setRooms(response.rooms);

      setRoomsNextCursor(response.nextCursor ?? null);

    } catch (err) {

      setError(

        err instanceof ApiError ? err.message : t("states.error.roomsLoadFailed"),

      );

    } finally {

      setLoading(false);

    }

  }, [search, category, t]);



  async function handleLoadMoreRooms() {

    if (!roomsNextCursor || loadingMoreRooms) {

      return;

    }



    setLoadingMoreRooms(true);



    try {

      const response = await getRooms({

        search: search.trim() || undefined,

        category: category ?? undefined,

        type: "PUBLIC",

        limit: 20,

        cursor: roomsNextCursor,

      });

      setRooms((current) => [...current, ...response.rooms]);

      setRoomsNextCursor(response.nextCursor ?? null);

    } catch (err) {

      setError(

        err instanceof ApiError ? err.message : t("states.error.roomsLoadFailed"),

      );

    } finally {

      setLoadingMoreRooms(false);

    }

  }



  useEffect(() => {

    const timer = setTimeout(() => {

      void loadRooms();

    }, 250);



    return () => clearTimeout(timer);

  }, [loadRooms]);



  const filterOptions = useMemo(

    () => [

      { value: null as RoomCategory | null, category: "ALL" },

      ...ROOM_CATEGORY_OPTIONS.map((item) => ({

        value: item.value,

        category: item.value,

      })),

    ],

    [],

  );



  function handleCreateClick() {

    if (!getToken()) {

      router.push("/login");

      return;

    }



    setModalOpen(true);
    trackEvent("room_create_clicked");
  }



  return (

    <>

      <div className="mx-auto flex max-w-6xl flex-col gap-6">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <h1 className="text-2xl font-semibold sm:text-3xl">{t("rooms.title")}</h1>

            <p className="mt-1 text-muted">{t("rooms.subtitleSimple")}</p>

            <Link href="/discover" className="mt-2 inline-block text-sm text-accent hover:underline">

              {t("rooms.popularLink")}

            </Link>

          </div>

          <Button onClick={handleCreateClick}>{t("rooms.create")}</Button>

        </div>



        <Input

          placeholder={t("rooms.searchPlaceholder")}

          value={search}

          onChange={(event) => setSearch(event.target.value)}

        />



        <div className="flex gap-2 overflow-x-auto pb-1">

          {filterOptions.map((item) => (

            <RoomCategoryPill

              key={item.category}

              label={getCategoryLabel(item.category, t)}

              active={category === item.value}

              onClick={() => setCategory(item.value)}

            />

          ))}

        </div>



        {loading ? <LoadingState label={t("states.loading.rooms")} rows={3} /> : null}



        {!loading && error ? (

          <ErrorState

            title={t("states.error.roomsLoadFailed")}

            description={error}

            onRetry={() => void loadRooms()}

          />

        ) : null}



        {!loading && !error && rooms.length === 0 ? (

          <EmptyState

            icon="◎"

            title={t("states.empty.noRooms")}

            description={t("states.empty.noRoomsDesc")}

            actionLabel={t("rooms.create")}

            onAction={handleCreateClick}

          />

        ) : null}



        {!loading && !error && rooms.length > 0 ? (

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {rooms.map((room) => (

              <RoomCard key={room.id} room={room} isMember={room.isMember} />

            ))}

          </div>

        ) : null}



        {!loading && !error && roomsNextCursor ? (

          <div className="flex justify-center">

            <Button

              variant="secondary"

              disabled={loadingMoreRooms}

              onClick={() => void handleLoadMoreRooms()}

            >

              {loadingMoreRooms ? t("common.loading") : t("common.loadMore")}

            </Button>

          </div>

        ) : null}

      </div>



      <CreateRoomModal

        open={modalOpen}

        onClose={() => setModalOpen(false)}

        onCreated={() => void loadRooms()}

      />

    </>

  );

}


