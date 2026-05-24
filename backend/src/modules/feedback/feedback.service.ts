import { FeedbackStatus, type Prisma } from "@prisma/client";
import { trackServerEvent } from "../../lib/analytics";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/asyncHandler";
import {
  buildOlderThanCursorFilter,
  clampLimit,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "../../utils/pagination";
import { trimAndLimit } from "../../utils/sanitizeInput";
import type {
  ListAdminFeedbackQuery,
  SubmitFeedbackInput,
  UpdateFeedbackStatusInput,
} from "./feedback.schemas";

const basicUserSelect = {
  id: true,
  username: true,
  handle: true,
  avatarUrl: true,
} as const;

const feedbackInclude = {
  user: { select: basicUserSelect },
} satisfies Prisma.FeedbackInclude;

type FeedbackWithUser = Prisma.FeedbackGetPayload<{
  include: typeof feedbackInclude;
}>;

function formatFeedbackUser(
  user: {
    id: string;
    username: string;
    handle: string;
    avatarUrl: string | null;
  } | null,
) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    handle: user.handle,
    avatarUrl: user.avatarUrl,
  };
}

function formatFeedback(feedback: FeedbackWithUser) {
  return {
    id: feedback.id,
    type: feedback.type,
    status: feedback.status,
    title: feedback.title,
    message: feedback.message,
    rating: feedback.rating,
    pageUrl: feedback.pageUrl,
    userAgent: feedback.userAgent,
    createdAt: feedback.createdAt.toISOString(),
    updatedAt: feedback.updatedAt.toISOString(),
    user: formatFeedbackUser(feedback.user),
  };
}

export async function submitFeedback(
  input: SubmitFeedbackInput,
  context: {
    userId?: string | null;
    userAgent?: string | null;
  },
) {
  const feedback = await prisma.feedback.create({
    data: {
      userId: context.userId ?? null,
      type: input.type,
      title: trimAndLimit(input.title, 120),
      message: trimAndLimit(input.message, 1000),
      rating: input.rating ?? null,
      pageUrl: input.pageUrl ? trimAndLimit(input.pageUrl, 500) : null,
      userAgent: context.userAgent?.slice(0, 500) ?? null,
    },
  });

  void trackServerEvent({
    eventName: "feedback_submitted",
    userId: context.userId ?? null,
    properties: {
      type: input.type,
      hasRating: input.rating != null,
    },
    path: input.pageUrl ?? null,
    userAgent: context.userAgent ?? null,
  });

  return {
    message: "Geri bildirimin için teşekkürler.",
    feedback: {
      id: feedback.id,
      type: feedback.type,
      status: feedback.status,
      createdAt: feedback.createdAt.toISOString(),
    },
  };
}

export async function listAdminFeedback(query: ListAdminFeedbackQuery) {
  const limit = clampLimit(query.limit, DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT);
  const where: Prisma.FeedbackWhereInput = {
    ...(query.status ? { status: query.status as FeedbackStatus } : {}),
    ...(query.type ? { type: query.type } : {}),
  };

  const cursorFeedback = query.cursor
    ? await prisma.feedback.findFirst({
        where: { id: query.cursor },
        select: { id: true, createdAt: true },
      })
    : null;

  const rows = await prisma.feedback.findMany({
    where: {
      ...where,
      ...buildOlderThanCursorFilter(cursorFeedback),
    },
    include: feedbackInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: limit + 1,
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const total = await prisma.feedback.count({ where });

  return {
    feedback: page.map((item) => formatFeedback(item)),
    nextCursor: hasMore ? page[page.length - 1]?.id ?? null : null,
    meta: { total },
  };
}

export async function updateAdminFeedbackStatus(
  feedbackId: string,
  input: UpdateFeedbackStatusInput,
) {
  const existing = await prisma.feedback.findUnique({
    where: { id: feedbackId },
  });

  if (!existing) {
    throw new AppError(404, "Geri bildirim bulunamadı");
  }

  const feedback = await prisma.feedback.update({
    where: { id: feedbackId },
    data: { status: input.status as FeedbackStatus },
    include: feedbackInclude,
  });

  return {
    message: "Geri bildirim durumu güncellendi.",
    feedback: formatFeedback(feedback),
  };
}
