-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ALTER COLUMN "billingKey" DROP NOT NULL,
ALTER COLUMN "nextBillingDate" DROP NOT NULL;
