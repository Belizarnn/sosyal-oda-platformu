-- Production'da daha yeni migration'lar uygulandıktan sonra eklenen assisted sync alanları.
-- IF NOT EXISTS ile güvenli tekrar çalıştırma.

ALTER TYPE "MediaMode" ADD VALUE IF NOT EXISTS 'ASSISTED_EXTERNAL_SYNC';

ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalSeason" INTEGER;
ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalEpisode" INTEGER;
ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalStartOffsetMinutes" DOUBLE PRECISION;
ALTER TABLE "RoomMediaState" ADD COLUMN IF NOT EXISTS "externalNotes" TEXT;
