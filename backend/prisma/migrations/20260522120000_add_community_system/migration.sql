-- CreateEnum
CREATE TYPE "CommunityVisibility" AS ENUM ('PUBLIC', 'INVITE_ONLY', 'PRIVATE');
CREATE TYPE "CommunityCategory" AS ENUM ('FILM', 'SERIES', 'ANIME', 'GAME', 'EDUCATION', 'FRIENDS', 'GENERAL');
CREATE TYPE "CommunityMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MODERATOR', 'MEMBER', 'GUEST');
CREATE TYPE "ChannelType" AS ENUM ('TEXT', 'VOICE', 'VIDEO', 'WATCH', 'ANNOUNCEMENT', 'PRIVATE');
CREATE TYPE "ChannelVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'COMMUNITY_INVITE';

-- AlterTable
ALTER TABLE "Room" ADD COLUMN IF NOT EXISTS "isCommunityBacking" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS "Room_isCommunityBacking_idx" ON "Room"("isCommunityBacking");

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "avatarUrl" TEXT,
    "visibility" "CommunityVisibility" NOT NULL DEFAULT 'PUBLIC',
    "category" "CommunityCategory" NOT NULL DEFAULT 'GENERAL',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityMember" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "CommunityMemberRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" TIMESTAMP(3),
    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityChannel" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "ChannelType" NOT NULL,
    "visibility" "ChannelVisibility" NOT NULL DEFAULT 'PUBLIC',
    "position" INTEGER NOT NULL DEFAULT 0,
    "backingRoomId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommunityChannel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChannelPermission" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "minRoleView" "CommunityMemberRole" NOT NULL DEFAULT 'GUEST',
    "minRoleSend" "CommunityMemberRole" NOT NULL DEFAULT 'MEMBER',
    "minRoleWatchStart" "CommunityMemberRole" NOT NULL DEFAULT 'MEMBER',
    "minRoleWatchControl" "CommunityMemberRole" NOT NULL DEFAULT 'MODERATOR',
    "minRoleVoice" "CommunityMemberRole" NOT NULL DEFAULT 'MEMBER',
    "minRoleVideo" "CommunityMemberRole" NOT NULL DEFAULT 'MEMBER',
    CONSTRAINT "ChannelPermission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CommunityInvite" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityInvite_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE INDEX "Community_visibility_idx" ON "Community"("visibility");
CREATE INDEX "Community_category_idx" ON "Community"("category");
CREATE INDEX "Community_ownerId_idx" ON "Community"("ownerId");
CREATE INDEX "Community_createdAt_idx" ON "Community"("createdAt");

CREATE UNIQUE INDEX "CommunityMember_communityId_userId_key" ON "CommunityMember"("communityId", "userId");
CREATE INDEX "CommunityMember_communityId_idx" ON "CommunityMember"("communityId");
CREATE INDEX "CommunityMember_userId_idx" ON "CommunityMember"("userId");
CREATE INDEX "CommunityMember_leftAt_idx" ON "CommunityMember"("leftAt");

CREATE UNIQUE INDEX "CommunityChannel_communityId_slug_key" ON "CommunityChannel"("communityId", "slug");
CREATE UNIQUE INDEX "CommunityChannel_backingRoomId_key" ON "CommunityChannel"("backingRoomId");
CREATE INDEX "CommunityChannel_communityId_position_idx" ON "CommunityChannel"("communityId", "position");
CREATE INDEX "CommunityChannel_type_idx" ON "CommunityChannel"("type");

CREATE UNIQUE INDEX "ChannelPermission_channelId_key" ON "ChannelPermission"("channelId");

CREATE UNIQUE INDEX "CommunityInvite_code_key" ON "CommunityInvite"("code");
CREATE INDEX "CommunityInvite_communityId_idx" ON "CommunityInvite"("communityId");
CREATE INDEX "CommunityInvite_isActive_idx" ON "CommunityInvite"("isActive");

-- ForeignKeys
ALTER TABLE "Community" ADD CONSTRAINT "Community_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityChannel" ADD CONSTRAINT "CommunityChannel_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityChannel" ADD CONSTRAINT "CommunityChannel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityChannel" ADD CONSTRAINT "CommunityChannel_backingRoomId_fkey" FOREIGN KEY ("backingRoomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChannelPermission" ADD CONSTRAINT "ChannelPermission_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "CommunityChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityInvite" ADD CONSTRAINT "CommunityInvite_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CommunityInvite" ADD CONSTRAINT "CommunityInvite_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
