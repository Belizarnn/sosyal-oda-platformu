import { prisma } from "./prisma";

const SCHEMA_REPAIRS = [
  `ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "isCommunityBacking" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalSeason" INTEGER`,
  `ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalEpisode" INTEGER`,
  `ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalStartOffsetMinutes" DOUBLE PRECISION`,
  `ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalNotes" TEXT`,
  `DO $$ BEGIN CREATE TYPE "ChannelPermissionTargetType" AS ENUM ('ROLE', 'MEMBER'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE TABLE IF NOT EXISTS "CommunityRole" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#99AAB5',
    "iconUrl" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "position" INTEGER NOT NULL DEFAULT 0,
    "hoist" BOOLEAN NOT NULL DEFAULT false,
    "mentionable" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isOwnerRole" BOOLEAN NOT NULL DEFAULT false,
    "systemKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityRole_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CommunityRole_communityId_name_key" ON "CommunityRole"("communityId", "name")`,
  `CREATE INDEX IF NOT EXISTS "CommunityRole_communityId_position_idx" ON "CommunityRole"("communityId", "position")`,
  `CREATE TABLE IF NOT EXISTS "CommunityMemberRoleAssignment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,
    CONSTRAINT "CommunityMemberRoleAssignment_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CommunityMemberRoleAssignment_memberId_roleId_key" ON "CommunityMemberRoleAssignment"("memberId", "roleId")`,
  `CREATE TABLE IF NOT EXISTS "ChannelPermissionOverride" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "targetType" "ChannelPermissionTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "allow" JSONB NOT NULL DEFAULT '{}',
    "deny" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelPermissionOverride_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ChannelPermissionOverride_channelId_targetType_targetId_key" ON "ChannelPermissionOverride"("channelId", "targetType", "targetId")`,
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
