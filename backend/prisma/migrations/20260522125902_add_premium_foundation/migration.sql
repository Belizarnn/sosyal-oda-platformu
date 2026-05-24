-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "premiumAvatarEffect" TEXT,
ADD COLUMN     "premiumBadgeVisible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "premiumExpiresAt" TIMESTAMP(3),
ADD COLUMN     "premiumPlan" TEXT,
ADD COLUMN     "premiumProfileFrame" TEXT,
ADD COLUMN     "premiumStartedAt" TIMESTAMP(3);
