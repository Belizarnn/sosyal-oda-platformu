-- CreateEnum
CREATE TYPE "CommunityBotType" AS ENUM ('MODERATION', 'LOG', 'WELCOME', 'TICKET', 'REACTION_ROLE', 'INVITE', 'GIVEAWAY', 'STATS', 'AUTO_REPLY', 'WEBHOOK', 'MUSIC', 'FUN', 'SECURITY');
CREATE TYPE "CommunityTicketStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "CommunityGiveawayStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');

-- AlterEnum ChannelType
ALTER TYPE "ChannelType" ADD VALUE IF NOT EXISTS 'READ_ONLY';
ALTER TYPE "ChannelType" ADD VALUE IF NOT EXISTS 'TICKET';
ALTER TYPE "ChannelType" ADD VALUE IF NOT EXISTS 'STATS';
ALTER TYPE "ChannelType" ADD VALUE IF NOT EXISTS 'LOG';

-- AlterTable
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "setupCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable CommunitySetupTemplate
CREATE TABLE IF NOT EXISTS "CommunitySetupTemplate" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "selectedChannels" JSONB NOT NULL DEFAULT '[]',
    "selectedBots" JSONB NOT NULL DEFAULT '{}',
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunitySetupTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CommunitySetupTemplate_communityId_key" ON "CommunitySetupTemplate"("communityId");

-- CreateTable CommunityBot
CREATE TABLE IF NOT EXISTS "CommunityBot" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "type" "CommunityBotType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityBot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CommunityBot_communityId_type_key" ON "CommunityBot"("communityId", "type");
CREATE INDEX IF NOT EXISTS "CommunityBot_communityId_enabled_idx" ON "CommunityBot"("communityId", "enabled");

-- CreateTable BotLog
CREATE TABLE IF NOT EXISTS "BotLog" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "botType" "CommunityBotType" NOT NULL,
    "action" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BotLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BotLog_communityId_createdAt_idx" ON "BotLog"("communityId", "createdAt");
CREATE INDEX IF NOT EXISTS "BotLog_botType_idx" ON "BotLog"("botType");

-- CreateTable AutoReplyRule
CREATE TABLE IF NOT EXISTS "AutoReplyRule" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "channelIds" JSONB NOT NULL DEFAULT '[]',
    "roleIds" JSONB NOT NULL DEFAULT '[]',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AutoReplyRule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AutoReplyRule_communityId_enabled_idx" ON "AutoReplyRule"("communityId", "enabled");

-- CreateTable ModerationRule
CREATE TABLE IF NOT EXISTS "ModerationRule" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "action" TEXT NOT NULL DEFAULT 'delete',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ModerationRule_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ModerationRule_communityId_type_key" ON "ModerationRule"("communityId", "type");

-- CreateTable WebhookIntegration
CREATE TABLE IF NOT EXISTS "WebhookIntegration" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "secretToken" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookIntegration_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WebhookIntegration_communityId_idx" ON "WebhookIntegration"("communityId");
CREATE INDEX IF NOT EXISTS "WebhookIntegration_secretToken_idx" ON "WebhookIntegration"("secretToken");

-- CreateTable ReactionRoleMessage
CREATE TABLE IF NOT EXISTS "ReactionRoleMessage" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "messageId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "items" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReactionRoleMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ReactionRoleMessage_communityId_idx" ON "ReactionRoleMessage"("communityId");

-- CreateTable CommunityTicket
CREATE TABLE IF NOT EXISTS "CommunityTicket" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "channelId" TEXT,
    "openedById" TEXT NOT NULL,
    "assignedRoleId" TEXT,
    "type" TEXT NOT NULL,
    "status" "CommunityTicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),
    CONSTRAINT "CommunityTicket_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CommunityTicket_communityId_status_idx" ON "CommunityTicket"("communityId", "status");

-- CreateTable CommunityGiveaway
CREATE TABLE IF NOT EXISTS "CommunityGiveaway" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "prize" TEXT NOT NULL,
    "winnerCount" INTEGER NOT NULL DEFAULT 1,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "CommunityGiveawayStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityGiveaway_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CommunityGiveaway_communityId_status_idx" ON "CommunityGiveaway"("communityId", "status");

-- CreateTable InviteStat
CREATE TABLE IF NOT EXISTS "InviteStat" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "usedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InviteStat_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "InviteStat_communityId_inviterId_idx" ON "InviteStat"("communityId", "inviterId");

-- AddForeignKeys (idempotent via DO blocks where needed)
DO $$ BEGIN
  ALTER TABLE "CommunitySetupTemplate" ADD CONSTRAINT "CommunitySetupTemplate_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CommunityBot" ADD CONSTRAINT "CommunityBot_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "BotLog" ADD CONSTRAINT "BotLog_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AutoReplyRule" ADD CONSTRAINT "AutoReplyRule_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ModerationRule" ADD CONSTRAINT "ModerationRule_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "WebhookIntegration" ADD CONSTRAINT "WebhookIntegration_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ReactionRoleMessage" ADD CONSTRAINT "ReactionRoleMessage_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CommunityTicket" ADD CONSTRAINT "CommunityTicket_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CommunityTicket" ADD CONSTRAINT "CommunityTicket_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CommunityGiveaway" ADD CONSTRAINT "CommunityGiveaway_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CommunityGiveaway" ADD CONSTRAINT "CommunityGiveaway_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InviteStat" ADD CONSTRAINT "InviteStat_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "InviteStat" ADD CONSTRAINT "InviteStat_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

UPDATE "Community" SET "setupCompleted" = true WHERE "id" IN (SELECT DISTINCT "communityId" FROM "CommunityChannel");
