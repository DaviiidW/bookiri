export { toMidnightMs, getNights, formatShortDate } from "@/lib/date-format";
import { toMidnightMs } from "@/lib/date-format";

export type CalendarView = "month" | "gantt" | "list";

export interface CalendarAvailabilityPeriod {
  startDate: string;
  endDate: string;
  description?: string | null;
}

export interface CalendarBooking {
  id: string;
  guestName: string;
  guestsTotal: number;
  checkInDate: string;
  checkOutDate: string;
  propertyId: string;
  propertyName: string;
  propertyColor: string;
  totalPrice: number;
  fullyPaid: boolean;
  depositPaid: boolean;
}

export interface CalendarProperty {
  id: string;
  name: string;
  color: string;
  maxGuests: number;
  availabilityPeriods: CalendarAvailabilityPeriod[];
  bookings: CalendarBooking[];
}

export function isDayAvailable(date: Date, periods: CalendarAvailabilityPeriod[]): boolean {
  const dayMs = toMidnightMs(date);
  return periods.some((p) => {
    const start = toMidnightMs(new Date(p.startDate));
    const end = toMidnightMs(new Date(p.endDate));
    return dayMs >= start && dayMs < end;
  });
}

export function getBookingsForDay(date: Date, bookings: CalendarBooking[]): CalendarBooking[] {
  const dayMs = toMidnightMs(date);
  return bookings.filter((b) => {
    const start = toMidnightMs(new Date(b.checkInDate));
    const end = toMidnightMs(new Date(b.checkOutDate));
    return dayMs >= start && dayMs <= end;
  });
}

export type BookingDayType = "checkin" | "checkout" | "middle";

export function getBookingDayType(date: Date, booking: CalendarBooking): BookingDayType {
  const dayMs = toMidnightMs(date);
  const checkIn = toMidnightMs(new Date(booking.checkInDate));
  const checkOut = toMidnightMs(new Date(booking.checkOutDate));
  if (dayMs === checkIn) return "checkin";
  if (dayMs === checkOut) return "checkout";
  return "middle";
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatMonthLabel(date: Date, locale = "es-ES"): string {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}
