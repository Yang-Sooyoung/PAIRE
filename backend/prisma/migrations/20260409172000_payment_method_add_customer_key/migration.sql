-- Add customerKey to payment_methods table
ALTER TABLE "payment_methods" ADD COLUMN IF NOT EXISTS "customerKey" TEXT;
