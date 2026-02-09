-- AlterTable
ALTER TABLE "PriceRule" ADD COLUMN     "courtId" INTEGER;

-- CreateIndex
CREATE INDEX "PriceRule_courtId_idx" ON "PriceRule"("courtId");

-- AddForeignKey
ALTER TABLE "PriceRule" ADD CONSTRAINT "PriceRule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;
