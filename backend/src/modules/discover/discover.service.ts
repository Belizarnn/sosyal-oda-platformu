import { RoomCategory, RoomType, type Room, type User } from "@prisma/client";

import { prisma } from "../../lib/prisma";

import {

  buildOlderThanCursorFilter,

  clampLimit,

  DEFAULT_PAGE_LIMIT,

  MAX_PAGE_LIMIT,

} from "../../utils/pagination";

import { roomOwnerSelect } from "../../utils/prismaSelects";

import { sanitizeOwner, sanitizeRoom } from "../../utils/sanitizeRoom";

import type { DiscoverRoomsQuery } from "./discover.schemas";



type RoomWithOwner = Room & {

  owner: Pick<User, "id" | "username" | "handle" | "avatarUrl">;

};



export type DiscoverRoomItem = {

  id: string;

  name: string;

  slug: string;

  description: string | null;

  category: RoomCategory;

  type: RoomType;

  currentUserCount: number;

  maxUserCount: number;

  inviteCode: string;

  createdAt: Date;

  owner: ReturnType<typeof sanitizeOwner>;

};



function formatDiscoverRoom(room: RoomWithOwner): DiscoverRoomItem {

  const safeRoom = sanitizeRoom(room);



  return {

    id: safeRoom.id,

    name: safeRoom.name,

    slug: safeRoom.slug,

    description: safeRoom.description,

    category: safeRoom.category,

    type: safeRoom.type,

    currentUserCount: safeRoom.currentUserCount,

    maxUserCount: safeRoom.maxUserCount,

    inviteCode: safeRoom.inviteCode,

    createdAt: safeRoom.createdAt,

    owner: sanitizeOwner(room.owner),

  };

}



function buildWhereClause(query: DiscoverRoomsQuery) {

  return {

    isActive: true,

    type: RoomType.PUBLIC,

    ...(query.category ? { category: query.category } : {}),

    ...(query.search

      ? {

          OR: [

            { name: { contains: query.search, mode: "insensitive" as const } },

            {

              description: {

                contains: query.search,

                mode: "insensitive" as const,

              },

            },

          ],

        }

      : {}),

  };

}



const INTEREST_CATEGORY_MAP: Record<string, RoomCategory> = {

  oyun: RoomCategory.GAME,

  game: RoomCategory.GAME,

  film: RoomCategory.FILM,

  ders: RoomCategory.STUDY,

  study: RoomCategory.STUDY,

  anime: RoomCategory.ANIME,

  muzik: RoomCategory.MUSIC,

  music: RoomCategory.MUSIC,

  sohbet: RoomCategory.CHAT,

  chat: RoomCategory.CHAT,

  yazilim: RoomCategory.SOFTWARE,

  software: RoomCategory.SOFTWARE,

  spor: RoomCategory.SPORTS,

  sports: RoomCategory.SPORTS,

};



function mapInterestsToCategories(interests: string[]): RoomCategory[] {

  const categories = new Set<RoomCategory>();



  for (const interest of interests) {

    const key = interest.trim().toLowerCase();

    const category = INTEREST_CATEGORY_MAP[key];



    if (category) {

      categories.add(category);

    }

  }



  return Array.from(categories);

}



function sortRecommendedRooms(

  rooms: RoomWithOwner[],

  preferredCategories: RoomCategory[],

): RoomWithOwner[] {

  return [...rooms].sort((left, right) => {

    const leftMatch = preferredCategories.includes(left.category) ? 1 : 0;

    const rightMatch = preferredCategories.includes(right.category) ? 1 : 0;



    if (leftMatch !== rightMatch) {

      return rightMatch - leftMatch;

    }



    if (left.currentUserCount !== right.currentUserCount) {

      return right.currentUserCount - left.currentUserCount;

    }



    return right.createdAt.getTime() - left.createdAt.getTime();

  });

}



async function loadCursorRoom(cursor?: string) {

  if (!cursor) {

    return null;

  }



  return prisma.room.findFirst({

    where: { id: cursor },

    select: { id: true, createdAt: true },

  });

}



export async function discoverRooms(

  query: DiscoverRoomsQuery,

  userId?: string,

) {

  const where = buildWhereClause(query);

  const limit = clampLimit(query.limit, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);

  const cursorRoom = await loadCursorRoom(query.cursor);

  const total = await prisma.room.count({ where });



  if (query.sort === "recommended") {

    const fetchSize = Math.min(limit * 3, 60);

    const rooms = await prisma.room.findMany({

      where: {

        ...where,

        currentUserCount: { gt: 0 },

        ...buildOlderThanCursorFilter(cursorRoom),

      },

      include: { owner: { select: roomOwnerSelect } },

      orderBy: [

        { currentUserCount: "desc" },

        { createdAt: "desc" },

        { id: "desc" },

      ],

      take: fetchSize + 1,

    });



    let preferredCategories: RoomCategory[] = [];



    if (userId) {

      const user = await prisma.user.findUnique({

        where: { id: userId },

        select: { profileInterests: true },

      });

      preferredCategories = mapInterestsToCategories(user?.profileInterests ?? []);

    }



    const hasMoreSource = rooms.length > fetchSize;

    const source = hasMoreSource ? rooms.slice(0, fetchSize) : rooms;

    const sorted = sortRecommendedRooms(source, preferredCategories).slice(0, limit);

    const nextCursor =

      sorted.length === limit && (hasMoreSource || source.length > limit)

        ? sorted[sorted.length - 1]?.id ?? null

        : null;



    return {

      rooms: sorted.map(formatDiscoverRoom),

      nextCursor,

      meta: {

        total,

        sort: query.sort,

        category: query.category ?? null,

        search: query.search ?? null,

      },

    };

  }



  const orderBy =

    query.sort === "newest"

      ? [{ createdAt: "desc" as const }, { id: "desc" as const }]

      : [{ currentUserCount: "desc" as const }, { updatedAt: "desc" as const }, { id: "desc" as const }];



  const rooms = await prisma.room.findMany({

    where: {

      ...where,

      ...buildOlderThanCursorFilter(cursorRoom),

    },

    include: { owner: { select: roomOwnerSelect } },

    orderBy,

    take: limit + 1,

  });



  const hasMore = rooms.length > limit;

  const page = hasMore ? rooms.slice(0, limit) : rooms;



  return {

    rooms: page.map(formatDiscoverRoom),

    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,

    meta: {

      total,

      sort: query.sort,

      category: query.category ?? null,

      search: query.search ?? null,

    },

  };

}


