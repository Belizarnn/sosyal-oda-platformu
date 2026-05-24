import { prisma } from "./prisma";

const SCHEMA_REPAIRS = [
  `ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "isCommunityBacking" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalSeason" INTEGER`,
  `ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalEpisode" INTEGER`,
  `ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalStartOffsetMinutes" DOUBLE PRECISION`,
  `ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalNotes" TEXT`,
] as const;

async function ensureMediaModeEnumValue(): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'MediaMode'
        AND e.enumlabel = 'ASSISTED_EXTERNAL_SYNC'
    ) AS "exists"
  `;

  if (rows[0]?.exists) {
    return;
  }

  await prisma.$executeRawUnsafe(
    `ALTER TYPE "MediaMode" ADD VALUE 'ASSISTED_EXTERNAL_SYNC'`,
  );
}

export async function ensureProductionSchema(): Promise<void> {
  for (const sql of SCHEMA_REPAIRS) {
    await prisma.$executeRawUnsafe(sql);
  }

  await ensureMediaModeEnumValue();
}

export async function verifyWatchSchema(): Promise<void> {
  await prisma.roomMediaState.findFirst({
    select: {
      id: true,
      externalSeason: true,
      externalEpisode: true,
      externalStartOffsetMinutes: true,
      externalNotes: true,
      mode: true,
    },
  });
}
