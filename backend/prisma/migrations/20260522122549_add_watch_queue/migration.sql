-- CreateEnum
CREATE TYPE "VideoQueueStatus" AS ENUM ('QUEUED', 'PLAYING', 'PLAYED', 'REMOVED');

-- CreateTable
CREATE TABLE "RoomVideoQueueItem" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "title" TEXT,
    "position" INTEGER NOT NULL,
    "status" "VideoQueueStatus" NOT NULL DEFAULT 'QUEUED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomVideoQueueItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoomVideoQueueItem_roomId_status_position_idx" ON "RoomVideoQueueItem"("roomId", "status", "position");

-- AddForeignKey
ALTER TABLE "RoomVideoQueueItem" ADD CONSTRAINT "RoomVideoQueueItem_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomVideoQueueItem" ADD CONSTRAINT "RoomVideoQueueItem_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
