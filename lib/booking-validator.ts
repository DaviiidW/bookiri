import { db } from "./db";

export interface BookingValidationResult {
  isValid: boolean;
  error?: string;
}

export async function validateBookingDates(
  bookingId: string | null,
  propertyId: string,
  checkInStr: string,
  checkOutStr: string
): Promise<BookingValidationResult> {
  const checkIn = new Date(checkInStr);
  checkIn.setHours(0, 0, 0, 0);
  const checkOut = new Date(checkOutStr);
  checkOut.setHours(0, 0, 0, 0);

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return { isValid: false, error: "Las fechas de reserva deben ser válidas." };
  }

  if (checkOut <= checkIn) {
    return { isValid: false, error: "La fecha de salida debe ser posterior a la fecha de entrada." };
  }

  const availabilityPeriods = await db.propertyAvailabilityPeriod.findMany({
    where: { propertyId },
  });

  const toMidnightUTC = (date: Date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  };

  const bStart = toMidnightUTC(checkIn);
  const bEnd = toMidnightUTC(checkOut);

  const normalizedPeriods = availabilityPeriods.map((p) => ({
    start: toMidnightUTC(p.startDate),
    end: toMidnightUTC(p.endDate),
  }));

  for (let day = new Date(bStart); day < bEnd; day.setUTCDate(day.getUTCDate() + 1)) {
    const currentNight = day.getTime();
    const nightIsAvailable = normalizedPeriods.some((p) => {
      return currentNight >= p.start.getTime() && currentNight < p.end.getTime();
    });

    if (!nightIsAvailable) {
      return {
        isValid: false,
        error: `Las fechas seleccionadas contienen días fuera de los periodos de disponibilidad de la vivienda.`,
      };
    }
  }

  const overlappingBookings = await db.booking.findMany({
    where: {
      propertyId,
      deletedAt: null,
      NOT: bookingId ? { id: bookingId } : undefined,
      checkInDate: { lt: checkOut },
      checkOutDate: { gt: checkIn },
    },
  });

  if (overlappingBookings.length > 0) {
    return {
      isValid: false,
      error: "Ya existe otra reserva confirmada para esta vivienda en las fechas seleccionadas.",
    };
  }

  return { isValid: true };
}
