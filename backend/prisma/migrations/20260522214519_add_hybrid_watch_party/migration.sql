-- CreateEnum
CREATE TYPE "MediaMode" AS ENUM ('EMBED', 'EXTERNAL_SYNC');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MediaProvider" ADD VALUE 'TWITCH';
ALTER TYPE "MediaProvider" ADD VALUE 'KICK';
ALTER TYPE "MediaProvider" ADD VALUE 'NETFLIX';
ALTER TYPE "MediaProvider" ADD VALUE 'DISNEY_PLUS';
ALTER TYPE "MediaProvider" ADD VALUE 'PRIME_VIDEO';

-- AlterTable
ALTER TABLE "RoomMediaState" ADD COLUMN     "countdownEndsAt" TIMESTAMP(3),
ADD COLUMN     "embedUrl" TEXT,
ADD COLUMN     "externalTitle" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "mode" "MediaMode" NOT NULL DEFAULT 'EMBED',
ALTER COLUMN "videoId" DROP NOT NULL,
ALTER COLUMN "videoUrl" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RoomWatchReady" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomWatchReady_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomWatchReady_roomId_idx" ON "RoomWatchReady"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomWatchReady_roomId_userId_key" ON "RoomWatchReady"("roomId", "userId");

-- AddForeignKey
ALTER TABLE "RoomWatchReady" ADD CONSTRAINT "RoomWatchReady_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomWatchReady" ADD CONSTRAINT "RoomWatchReady_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
