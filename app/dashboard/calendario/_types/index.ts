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

export function toMidnightMs(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
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

export function getNights(checkIn: string, checkOut: string): number {
  const a = toMidnightMs(new Date(checkIn));
  const b = toMidnightMs(new Date(checkOut));
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(date: Date | string, locale = "es-ES"): string {
  return new Date(date).toLocaleDateString(locale, { day: "numeric", month: "short" });
}

export function formatMonthLabel(date: Date, locale = "es-ES"): string {
  return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
}
