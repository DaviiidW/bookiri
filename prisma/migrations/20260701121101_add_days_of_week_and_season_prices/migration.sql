-- AlterTable
ALTER TABLE "SharedCalendar" ADD COLUMN     "showSeasonPrices" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SharedCalendarPriceRule" ADD COLUMN     "daysOfWeek" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
