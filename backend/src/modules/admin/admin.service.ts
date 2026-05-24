import {

  ReportStatus,

  ReportTargetType,

  type Prisma,

} from "@prisma/client";

import { prisma } from "../../lib/prisma";

import { AppError } from "../../utils/asyncHandler";

import {

  buildOlderThanCursorFilter,

  clampLimit,

  DEFAULT_PAGE_LIMIT,

  MAX_PAGE_LIMIT,

} from "../../utils/pagination";

import type {

  ListAdminReportsQuery,

  UpdateReportStatusInput,

} from "./admin.schemas";

import { getAnalyticsSummary } from "../analytics/analytics.service";
import {
  listAdminFeedback,
  updateAdminFeedbackStatus,
} from "../feedback/feedback.service";
import {
  createAdminBetaCode,
  listAdminBetaCodes,
} from "../beta/beta.service";



const basicUserSelect = {

  id: true,

  username: true,

  handle: true,

  avatarUrl: true,

} as const;



const reportInclude = {

  reporter: { select: basicUserSelect },

  targetUser: { select: basicUserSelect },

  targetRoom: {

    select: {

      id: true,

      name: true,

      slug: true,

      category: true,

      isActive: true,

    },

  },

  targetMessage: {

    select: {

      id: true,

      content: true,

      roomId: true,

      createdAt: true,

      deletedAt: true,

      sender: { select: basicUserSelect },

    },

  },

} satisfies Prisma.ReportInclude;



type ReportWithRelations = Prisma.ReportGetPayload<{

  include: typeof reportInclude;

}>;



function formatBasicUser(user: {

  id: string;

  username: string;

  handle: string;

  avatarUrl: string | null;

}) {

  return {

    id: user.id,

    username: user.username,

    handle: user.handle,

    avatarUrl: user.avatarUrl,

  };

}



function truncateContent(content: string, maxLength = 120) {

  if (content.length <= maxLength) {

    return content;

  }



  return `${content.slice(0, maxLength)}...`;

}



function buildReportLinks(report: ReportWithRelations) {

  return {

    profilePath: report.targetUser

      ? `/profile/${report.targetUser.handle}`

      : report.targetMessage?.sender

        ? `/profile/${report.targetMessage.sender.handle}`

        : null,

    roomPath: report.targetRoom

      ? `/rooms/${report.targetRoom.id}`

      : report.targetMessage?.roomId

        ? `/rooms/${report.targetMessage.roomId}`

        : null,

  };

}



function formatAdminReport(report: ReportWithRelations, compact = false) {

  return {

    id: report.id,

    targetType: report.targetType,

    reason: report.reason,

    description: report.description,

    status: report.status,

    createdAt: report.createdAt.toISOString(),

    updatedAt: report.updatedAt.toISOString(),

    reporter: formatBasicUser(report.reporter),

    targetUser: report.targetUser ? formatBasicUser(report.targetUser) : null,

    targetRoom: report.targetRoom

      ? {

          id: report.targetRoom.id,

          name: report.targetRoom.name,

          slug: report.targetRoom.slug,

          category: report.targetRoom.category,

          isActive: report.targetRoom.isActive,

        }

      : null,

    targetMessage: report.targetMessage

      ? {

          id: report.targetMessage.id,

          content: compact

            ? truncateContent(report.targetMessage.content)

            : report.targetMessage.content,

          roomId: report.targetMessage.roomId,

          createdAt: report.targetMessage.createdAt.toISOString(),

          deletedAt: report.targetMessage.deletedAt?.toISOString() ?? null,

          sender: formatBasicUser(report.targetMessage.sender),

        }

      : null,

    links: buildReportLinks(report),

  };

}



export async function getAdminSummary() {

  const [usersCount, roomsCount, openReportsCount, messagesCount, activeRoomsCount] =

    await Promise.all([

      prisma.user.count(),

      prisma.room.count(),

      prisma.report.count({ where: { status: ReportStatus.OPEN } }),

      prisma.message.count({ where: { deletedAt: null } }),

      prisma.room.count({ where: { isActive: true, currentUserCount: { gt: 0 } } }),

    ]);



  return {

    usersCount,

    roomsCount,

    openReportsCount,

    messagesCount,

    activeRoomsCount,

  };

}



export async function listAdminReports(query: ListAdminReportsQuery) {

  const where: Prisma.ReportWhereInput = {

    ...(query.status ? { status: query.status } : {}),

    ...(query.targetType ? { targetType: query.targetType } : {}),

  };



  const limit = clampLimit(query.limit, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);

  const cursorReport = query.cursor

    ? await prisma.report.findFirst({

        where: { id: query.cursor },

        select: { id: true, createdAt: true },

      })

    : null;



  const reports = await prisma.report.findMany({

    where: {

      ...where,

      ...buildOlderThanCursorFilter(cursorReport),

    },

    include: reportInclude,

    orderBy: [{ createdAt: "desc" }, { id: "desc" }],

    take: limit + 1,

  });



  const hasMore = reports.length > limit;

  const page = hasMore ? reports.slice(0, limit) : reports;



  const total = await prisma.report.count({ where });



  return {

    reports: page.map((report) => formatAdminReport(report, true)),

    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,

    meta: { total },

  };

}



export async function getAdminReportById(reportId: string) {

  const report = await prisma.report.findUnique({

    where: { id: reportId },

    include: reportInclude,

  });



  if (!report) {

    throw new AppError(404, "Rapor bulunamadı");

  }



  return { report: formatAdminReport(report) };

}



export async function updateAdminReportStatus(

  reportId: string,

  input: UpdateReportStatusInput,

) {

  const existing = await prisma.report.findUnique({

    where: { id: reportId },

  });



  if (!existing) {

    throw new AppError(404, "Rapor bulunamadı");

  }



  const report = await prisma.report.update({

    where: { id: reportId },

    data: { status: input.status },

    include: reportInclude,

  });



  return { report: formatAdminReport(report) };

}

export {
  getAnalyticsSummary,
  listAdminFeedback,
  updateAdminFeedbackStatus,
  listAdminBetaCodes,
  createAdminBetaCode,
};
