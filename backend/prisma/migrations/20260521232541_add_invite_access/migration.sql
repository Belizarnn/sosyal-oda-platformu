-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "inviteCreatedAt" TIMESTAMP(3),
ADD COLUMN     "inviteEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "inviteUpdatedAt" TIMESTAMP(3);
