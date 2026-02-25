-- AlterEnum
ALTER TYPE "BillingInterval" ADD VALUE 'WEEKLY';

-- AlterTable
ALTER TABLE "drinks" ADD COLUMN     "purchaseUrl" TEXT;
