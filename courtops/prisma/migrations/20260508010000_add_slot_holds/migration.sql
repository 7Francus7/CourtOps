CREATE TABLE "SlotHold" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "courtId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "ownerToken" TEXT NOT NULL,
    "holdToken" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "releasedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SlotHold_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SlotHold_holdToken_key" ON "SlotHold"("holdToken");
CREATE INDEX "SlotHold_clubId_courtId_startTime_idx" ON "SlotHold"("clubId", "courtId", "startTime");
CREATE INDEX "SlotHold_clubId_ownerToken_status_idx" ON "SlotHold"("clubId", "ownerToken", "status");
CREATE INDEX "SlotHold_clubId_status_expiresAt_idx" ON "SlotHold"("clubId", "status", "expiresAt");
CREATE INDEX "SlotHold_bookingId_idx" ON "SlotHold"("bookingId");

ALTER TABLE "SlotHold"
ADD CONSTRAINT "SlotHold_clubId_fkey"
FOREIGN KEY ("clubId") REFERENCES "Club"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "SlotHold"
ADD CONSTRAINT "SlotHold_courtId_fkey"
FOREIGN KEY ("courtId") REFERENCES "Court"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "SlotHold"
ADD CONSTRAINT "SlotHold_bookingId_fkey"
FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
