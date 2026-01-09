-- AlterTable
ALTER TABLE "Client" ADD COLUMN "membershipStatus" TEXT NOT NULL DEFAULT 'NONE',
ADD COLUMN "membershipExpiresAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PriceRule" ADD COLUMN "memberPrice" DOUBLE PRECISION;
