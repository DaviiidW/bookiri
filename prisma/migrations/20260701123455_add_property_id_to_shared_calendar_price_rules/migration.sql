/*
  Warnings:

  - Added the required column `propertyId` to the `SharedCalendarPriceRule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SharedCalendarPriceRule" ADD COLUMN     "propertyId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "SharedCalendarPriceRule" ADD CONSTRAINT "SharedCalendarPriceRule_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
