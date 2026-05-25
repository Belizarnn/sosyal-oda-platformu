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
  `ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "setupCompleted" BOOLEAN NOT NULL DEFAULT false`,
  `DO $$ BEGIN CREATE TYPE "CommunityBotType" AS ENUM ('MODERATION', 'LOG', 'WELCOME', 'TICKET', 'REACTION_ROLE', 'INVITE', 'GIVEAWAY', 'STATS', 'AUTO_REPLY', 'WEBHOOK', 'MUSIC', 'FUN', 'SECURITY'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "CommunityTicketStatus" AS ENUM ('OPEN', 'CLOSED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN CREATE TYPE "CommunityGiveawayStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `CREATE TABLE IF NOT EXISTS "CommunitySetupTemplate" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "selectedChannels" JSONB NOT NULL DEFAULT '[]',
    "selectedBots" JSONB NOT NULL DEFAULT '{}',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunitySetupTemplate_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CommunitySetupTemplate_communityId_key" ON "CommunitySetupTemplate"("communityId")`,
  `CREATE TABLE IF NOT EXISTS "CommunityBot" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "type" "CommunityBotType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityBot_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CommunityBot_communityId_type_key" ON "CommunityBot"("communityId", "type")`,
  `CREATE INDEX IF NOT EXISTS "CommunityBot_communityId_enabled_idx" ON "CommunityBot"("communityId", "enabled")`,
  `CREATE TABLE IF NOT EXISTS "BotLog" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "botType" "CommunityBotType" NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BotLog_pkey" PRIMARY KEY ("id")
  )`,
  `CREATE INDEX IF NOT EXISTS "BotLog_communityId_createdAt_idx" ON "BotLog"("communityId", "createdAt")`,
  `CREATE INDEX IF NOT EXISTS "BotLog_botType_idx" ON "BotLog"("botType")`,
  `DO $$ BEGIN ALTER TABLE "CommunitySetupTemplate" ADD CONSTRAINT "CommunitySetupTemplate_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "CommunityBot" ADD CONSTRAINT "CommunityBot_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `DO $$ BEGIN ALTER TABLE "BotLog" ADD CONSTRAINT "BotLog_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE; EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
] as const;

const CHANNEL_TYPE_VALUES = ["READ_ONLY", "TICKET", "STATS", "LOG"] as const;

async function ensureEnumLabel(typeName: string, label: string): Promise<void> {
  const rows = await prisma.$queryRaw<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = ${typeName}
        AND e.enumlabel = ${label}
    ) AS "exists"
  `;

  if (rows[0]?.exists) {
    return;
  }

  await prisma.$executeRawUnsafe(
    `ALTER TYPE "${typeName}" ADD VALUE '${label}'`,
  );
}

async function ensureChannelTypeEnumValues(): Promise<void> {
  for (const value of CHANNEL_TYPE_VALUES) {
    await ensureEnumLabel("ChannelType", value);
  }
}

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
  await ensureChannelTypeEnumValues();
}

export async function verifyCommunitySetupSchema(): Promise<void> {
  await prisma.communitySetupTemplate.findFirst({
    select: { id: true },
  });
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
