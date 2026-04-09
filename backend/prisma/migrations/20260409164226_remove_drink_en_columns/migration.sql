-- Remove unused nameEn and descriptionEn columns from drinks table
-- These columns were added but never populated (all NULL)

ALTER TABLE "drinks" DROP COLUMN IF EXISTS "nameEn";
ALTER TABLE "drinks" DROP COLUMN IF EXISTS "descriptionEn";

-- Clear AI recommendation cache (stale Korean-language cache)
TRUNCATE TABLE "ai_recommendation_cache";
