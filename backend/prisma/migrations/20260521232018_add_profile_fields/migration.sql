-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profileInterests" TEXT[] DEFAULT ARRAY[]::TEXT[];
