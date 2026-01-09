-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN IF NOT EXISTS "bookingId" INTEGER;

-- AlterTable
ALTER TABLE "BookingItem" ADD COLUMN IF NOT EXISTS "playerName" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "BookingPlayer" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paymentMethod" TEXT,

    CONSTRAINT "BookingPlayer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'BookingPlayer_bookingId_fkey') THEN
        ALTER TABLE "BookingPlayer" ADD CONSTRAINT "BookingPlayer_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Transaction_bookingId_fkey') THEN
        ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
