-- AlterTable: Add Stripe fields to Club
ALTER TABLE "Club" ADD COLUMN "paymentProvider" TEXT NOT NULL DEFAULT 'mercadopago';
ALTER TABLE "Club" ADD COLUMN "stripeSecretKey" TEXT;
ALTER TABLE "Club" ADD COLUMN "stripePublicKey" TEXT;
ALTER TABLE "Club" ADD COLUMN "stripeSubscriptionId" TEXT;
ALTER TABLE "Club" ADD COLUMN "stripeCustomerId" TEXT;

-- AlterTable: Add Stripe price IDs to PlatformPlan
ALTER TABLE "PlatformPlan" ADD COLUMN "stripePriceIdMonthly" TEXT;
ALTER TABLE "PlatformPlan" ADD COLUMN "stripePriceIdYearly" TEXT;
