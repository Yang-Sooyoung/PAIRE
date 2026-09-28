-- PAIRÉ Database Schema for Supabase

-- Create enum types
CREATE TYPE "Membership" AS ENUM ('FREE', 'PREMIUM');
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'ANNUALLY', 'WEEKLY');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'FAILED');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- Users table
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT,
    "username" TEXT NOT NULL,
    "nickname" TEXT,
    "membership" "Membership" NOT NULL DEFAULT 'FREE',
    "roles" TEXT[] DEFAULT ARRAY['USER']::TEXT[],
    "provider" TEXT,
    "providerId" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("provider", "providerId")
);

-- Subscriptions table
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "membership" "Membership" NOT NULL,
    "interval" "BillingInterval" NOT NULL,
    "price" INTEGER NOT NULL,
    "billingKey" TEXT,
    "nextBillingDate" TIMESTAMP(3),
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "lastPaymentKey" TEXT,
    "lastOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- PaymentMethod table
CREATE TABLE "payment_methods" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "billingKey" TEXT NOT NULL,
    "customerKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Recommendations table
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "imageUrl" TEXT,
    "occasion" TEXT NOT NULL,
    "tastes" TEXT[],
    "drinks" JSONB NOT NULL,
    "fairyMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL
);

-- Drinks table
CREATE TABLE "drinks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameKo" TEXT,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tastingNotes" TEXT[],
    "image" TEXT,
    "price" TEXT NOT NULL,
    "foodPairings" TEXT[],
    "occasions" TEXT[],
    "tastes" TEXT[],
    "purchaseUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Favorites table
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "drinkId" TEXT NOT NULL,
    "drinkName" TEXT NOT NULL,
    "drinkType" TEXT NOT NULL,
    "drinkImage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "drinkId"),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- Payments table
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "paymentKey" TEXT NOT NULL UNIQUE,
    "orderId" TEXT NOT NULL UNIQUE,
    "amount" INTEGER NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreditPurchase table
CREATE TABLE "credit_purchases" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "packageType" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "paymentKey" TEXT,
    "orderId" TEXT NOT NULL UNIQUE,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- SupportMessage table
CREATE TABLE "support_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- UserSticker table
CREATE TABLE "user_stickers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "stickerId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("userId", "stickerId"),
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);

-- AiRecommendationCache table
CREATE TABLE "ai_recommendation_cache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foodKeywords" TEXT[],
    "foodCategory" TEXT NOT NULL,
    "occasion" TEXT,
    "tastes" TEXT[],
    "cacheKey" TEXT NOT NULL UNIQUE,
    "recommendations" JSONB NOT NULL,
    "fairyMessage" TEXT NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");
CREATE INDEX "recommendations_userId_createdAt_idx" ON "recommendations"("userId", "createdAt" DESC);
CREATE INDEX "drinks_type_idx" ON "drinks"("type");
CREATE INDEX "ai_recommendation_cache_cacheKey_idx" ON "ai_recommendation_cache"("cacheKey");
CREATE INDEX "ai_recommendation_cache_foodCategory_occasion_idx" ON "ai_recommendation_cache"("foodCategory", "occasion");
CREATE INDEX "payments_userId_idx" ON "payments"("userId");
