/*
  Warnings:

  - You are about to drop the `pairing_rules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `standard_menus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "pairing_rules";

-- DropTable
DROP TABLE "standard_menus";

-- CreateIndex
CREATE INDEX "drinks_type_idx" ON "drinks"("type");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE INDEX "recommendations_userId_createdAt_idx" ON "recommendations"("userId", "createdAt" DESC);
