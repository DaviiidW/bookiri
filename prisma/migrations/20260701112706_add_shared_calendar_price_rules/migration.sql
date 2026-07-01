-- CreateTable
CREATE TABLE "SharedCalendarPriceRule" (
    "id" TEXT NOT NULL,
    "sharedCalendarId" TEXT NOT NULL,
    "label" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "pricePerNight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SharedCalendarPriceRule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SharedCalendarPriceRule" ADD CONSTRAINT "SharedCalendarPriceRule_sharedCalendarId_fkey" FOREIGN KEY ("sharedCalendarId") REFERENCES "SharedCalendar"("id") ON DELETE CASCADE ON UPDATE CASCADE;
