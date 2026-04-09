-- Add payment tracking columns to subscriptions table
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "lastPaymentKey" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "lastOrderId" TEXT;

-- Add index for userId + status lookup
CREATE INDEX IF NOT EXISTS "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");
