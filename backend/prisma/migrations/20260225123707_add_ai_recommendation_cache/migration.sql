-- CreateTable
CREATE TABLE "ai_recommendation_cache" (
    "id" TEXT NOT NULL,
    "foodKeywords" TEXT[],
    "foodCategory" TEXT NOT NULL,
    "occasion" TEXT,
    "tastes" TEXT[],
    "cacheKey" TEXT NOT NULL,
    "recommendations" JSONB NOT NULL,
    "fairyMessage" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_recommendation_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ai_recommendation_cache_cacheKey_key" ON "ai_recommendation_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "ai_recommendation_cache_cacheKey_idx" ON "ai_recommendation_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "ai_recommendation_cache_foodCategory_occasion_idx" ON "ai_recommendation_cache"("foodCategory", "occasion");
