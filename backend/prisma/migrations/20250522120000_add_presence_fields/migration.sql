-- AlterEnum
ALTER TYPE "PresenceStatus" ADD VALUE 'OFFLINE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastSeenAt" TIMESTAMP(3);
