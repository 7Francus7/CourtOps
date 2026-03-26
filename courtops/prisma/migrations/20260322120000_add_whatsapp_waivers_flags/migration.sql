-- AddColumn hasWhatsApp and hasWaivers to Club
ALTER TABLE "Club" ADD COLUMN IF NOT EXISTS "hasWhatsApp" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Club" ADD COLUMN IF NOT EXISTS "hasWaivers" BOOLEAN NOT NULL DEFAULT false;
