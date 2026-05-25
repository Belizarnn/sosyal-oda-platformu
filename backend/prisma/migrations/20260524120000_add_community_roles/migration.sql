-- CreateEnum
CREATE TYPE "ChannelPermissionTargetType" AS ENUM ('ROLE', 'MEMBER');

-- CreateTable
CREATE TABLE "CommunityRole" (
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMemberRoleAssignment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedById" TEXT,

    CONSTRAINT "CommunityMemberRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChannelPermissionOverride" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "targetType" "ChannelPermissionTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "allow" JSONB NOT NULL DEFAULT '{}',
    "deny" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelPermissionOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommunityRole_communityId_position_idx" ON "CommunityRole"("communityId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityRole_communityId_name_key" ON "CommunityRole"("communityId", "name");

-- CreateIndex
CREATE INDEX "CommunityMemberRoleAssignment_memberId_idx" ON "CommunityMemberRoleAssignment"("memberId");

-- CreateIndex
CREATE INDEX "CommunityMemberRoleAssignment_roleId_idx" ON "CommunityMemberRoleAssignment"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMemberRoleAssignment_memberId_roleId_key" ON "CommunityMemberRoleAssignment"("memberId", "roleId");

-- CreateIndex
CREATE INDEX "ChannelPermissionOverride_channelId_idx" ON "ChannelPermissionOverride"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "ChannelPermissionOverride_channelId_targetType_targetId_key" ON "ChannelPermissionOverride"("channelId", "targetType", "targetId");

-- AddForeignKey
ALTER TABLE "CommunityRole" ADD CONSTRAINT "CommunityRole_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMemberRoleAssignment" ADD CONSTRAINT "CommunityMemberRoleAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "CommunityMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMemberRoleAssignment" ADD CONSTRAINT "CommunityMemberRoleAssignment_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "CommunityRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMemberRoleAssignment" ADD CONSTRAINT "CommunityMemberRoleAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelPermissionOverride" ADD CONSTRAINT "ChannelPermissionOverride_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "CommunityChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
