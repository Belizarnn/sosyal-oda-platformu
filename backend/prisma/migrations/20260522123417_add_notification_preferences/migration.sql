-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyFriendAccepted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyRoomActivity" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifySystem" BOOLEAN NOT NULL DEFAULT true;
