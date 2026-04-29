ALTER TABLE "Club" ADD COLUMN "setupFeePaidAt" TIMESTAMP(3);
ALTER TABLE "Club" ADD COLUMN "setupFeePaymentId" TEXT;

UPDATE "Club"
SET "setupFeePaidAt" = COALESCE("nextBillingDate", "updatedAt"),
    "setupFeePaymentId" = "mpPreapprovalId"
WHERE "mpPreapprovalId" IS NOT NULL
  AND "subscriptionStatus" NOT IN ('TRIAL', 'EXPIRED');
