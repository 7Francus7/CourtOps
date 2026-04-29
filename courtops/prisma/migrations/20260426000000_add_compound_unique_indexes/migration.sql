-- Add compound unique indexes to MembershipPlan, Tournament, and Waiver.
-- These align them with the existing id_clubId pattern used by Booking,
-- Employee, Client, CashRegister, etc., and allow Prisma to use
-- { id_clubId: { id, clubId } } in update/delete where clauses for
-- defense-in-depth tenant isolation.
--
-- Run locally before deploying:
--   npm run db:migrate    (runs prisma migrate deploy)

CREATE UNIQUE INDEX IF NOT EXISTS "MembershipPlan_id_clubId_key"
  ON "MembershipPlan"("id", "clubId");

CREATE UNIQUE INDEX IF NOT EXISTS "Tournament_id_clubId_key"
  ON "Tournament"("id", "clubId");

CREATE UNIQUE INDEX IF NOT EXISTS "Waiver_id_clubId_key"
  ON "Waiver"("id", "clubId");
