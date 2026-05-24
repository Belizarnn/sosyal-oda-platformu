-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('YOUTUBE');

-- CreateTable
CREATE TABLE "RoomMediaState" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "provider" "MediaProvider" NOT NULL DEFAULT 'YOUTUBE',
    "videoId" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "title" TEXT,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "currentTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hostUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomMediaState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoomMediaState_roomId_key" ON "RoomMediaState"("roomId");

-- AddForeignKey
ALTER TABLE "RoomMediaState" ADD CONSTRAINT "RoomMediaState_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomMediaState" ADD CONSTRAINT "RoomMediaState_hostUserId_fkey" FOREIGN KEY ("hostUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
