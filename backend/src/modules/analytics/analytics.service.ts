import { prisma } from "../../lib/prisma";
import { sanitizeAnalyticsProperties, trackServerEvent } from "../../lib/analytics";
import type { TrackAnalyticsEventInput } from "./analytics.schemas";

function getStartOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

export async function trackClientEvent(
  input: TrackAnalyticsEventInput,
  context: {
    userId?: string | null;
    userAgent?: string | null;
  },
) {
  await trackServerEvent({
    eventName: input.eventName,
    userId: context.userId ?? null,
    properties: input.properties as Record<string, unknown> | undefined,
    sessionId: input.sessionId,
    path: input.path,
    userAgent: context.userAgent,
  });

  return { received: true };
}

export async function getAnalyticsSummary() {
  const startOfToday = getStartOfToday();

  const [
    usersRegistered,
    roomsCreated,
    messagesSent,
    dmMessagesSent,
    watchPartiesStarted,
    activeUsersTodayRows,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { eventName: "user_registered" } }),
    prisma.analyticsEvent.count({ where: { eventName: "room_created" } }),
    prisma.analyticsEvent.count({ where: { eventName: "message_sent" } }),
    prisma.analyticsEvent.count({ where: { eventName: "dm_sent" } }),
    prisma.analyticsEvent.count({ where: { eventName: "watch_video_set" } }),
    prisma.analyticsEvent.findMany({
      where: {
        createdAt: { gte: startOfToday },
        userId: { not: null },
      },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);

  return {
    usersRegistered,
    roomsCreated,
    messagesSent,
    dmMessagesSent,
    watchPartiesStarted,
    activeUsersToday: activeUsersTodayRows.length,
  };
}

export { sanitizeAnalyticsProperties };
