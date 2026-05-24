-- AlterEnum
ALTER TYPE "MediaMode" ADD VALUE IF NOT EXISTS 'ASSISTED_EXTERNAL_SYNC';

-- AlterTable
ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalSeason" INTEGER;
ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalEpisode" INTEGER;
ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalStartOffsetMinutes" DOUBLE PRECISION;
ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalNotes" TEXT;

-- Migrate subscription providers to assisted mode
UPDATE "RoomMediaState"
SET "mode" = 'ASSISTED_EXTERNAL_SYNC'
WHERE "provider" IN ('DISNEY_PLUS', 'NETFLIX', 'PRIME_VIDEO')
  AND "mode" = 'EXTERNAL_SYNC';
