-- CreateTable
CREATE TABLE "BetaAccessCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "BetaAccessCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetaAccessRedemption" (
    "id" TEXT NOT NULL,
    "codeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetaAccessRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BetaAccessCode_code_key" ON "BetaAccessCode"("code");

-- CreateIndex
CREATE INDEX "BetaAccessCode_isActive_idx" ON "BetaAccessCode"("isActive");

-- CreateIndex
CREATE INDEX "BetaAccessRedemption_codeId_idx" ON "BetaAccessRedemption"("codeId");

-- CreateIndex
CREATE INDEX "BetaAccessRedemption_userId_idx" ON "BetaAccessRedemption"("userId");

-- AddForeignKey
ALTER TABLE "BetaAccessRedemption" ADD CONSTRAINT "BetaAccessRedemption_codeId_fkey" FOREIGN KEY ("codeId") REFERENCES "BetaAccessCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BetaAccessRedemption" ADD CONSTRAINT "BetaAccessRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
