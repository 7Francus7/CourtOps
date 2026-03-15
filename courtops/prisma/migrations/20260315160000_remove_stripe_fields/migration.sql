-- Remove Stripe fields from Club
ALTER TABLE "Club" DROP COLUMN IF EXISTS "paymentProvider";
ALTER TABLE "Club" DROP COLUMN IF EXISTS "stripeSecretKey";
ALTER TABLE "Club" DROP COLUMN IF EXISTS "stripePublicKey";
ALTER TABLE "Club" DROP COLUMN IF EXISTS "stripeSubscriptionId";
ALTER TABLE "Club" DROP COLUMN IF EXISTS "stripeCustomerId";

-- Remove Stripe price IDs from PlatformPlan
ALTER TABLE "PlatformPlan" DROP COLUMN IF EXISTS "stripePriceIdMonthly";
ALTER TABLE "PlatformPlan" DROP COLUMN IF EXISTS "stripePriceIdYearly";
