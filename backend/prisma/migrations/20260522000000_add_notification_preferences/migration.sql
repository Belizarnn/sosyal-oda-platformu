-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyFriendRequests" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyDmMessages" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyRoomModeration" BOOLEAN NOT NULL DEFAULT true;
