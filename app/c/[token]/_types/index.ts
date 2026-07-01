export interface PublicPriceRule {
  id: string;
  label: string | null;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  daysOfWeek: number[];
  propertyId: string;
}

export interface PublicSeason {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  color: string;
}

export interface OccupiedRange {
  checkInDate: string;
  checkOutDate: string;
}

export interface PublicProperty {
  id: string;
  name: string;
  color: string;
  availabilityPeriods: { startDate: string; endDate: string }[];
  occupiedRanges: OccupiedRange[];
  priceRules: PublicPriceRule[];
  seasons: PublicSeason[];
}

export interface PublicCalendarData {
  name: string | null;
  showPrice: boolean;
  showSeasonPrices: boolean;
  viewType: string;
  properties: PublicProperty[];
}

export function toMidnightMs(date: Date | string): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const d = new Date(year, month, 1);
  while (d.getMonth() === month) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

export function formatMonthLabel(date: Date): string {
  return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

export type DayStatus = "available" | "occupied" | "unavailable" | "past";

export function getDayStatus(date: Date, property: PublicProperty): DayStatus {
  const dayMs = toMidnightMs(date);
  const todayMs = toMidnightMs(new Date());

  if (dayMs < todayMs) return "past";

  const isAvailable = property.availabilityPeriods.some((p) => {
    const start = toMidnightMs(new Date(p.startDate));
    const end = toMidnightMs(new Date(p.endDate));
    return dayMs >= start && dayMs < end;
  });

  if (!isAvailable) return "unavailable";

  const isOccupied = property.occupiedRanges.some((r) => {
    const start = toMidnightMs(new Date(r.checkInDate));
    const end = toMidnightMs(new Date(r.checkOutDate));
    return dayMs >= start && dayMs < end;
  });

  return isOccupied ? "occupied" : "available";
}

export function jsWeekdayToIso(day: number): number {
  return day === 0 ? 7 : day;
}

export interface PriceResolution {
  price: number;
  source: "rule" | "season";
  label: string | null;
}

export function getPriceForDay(
  date: Date,
  rules: PublicPriceRule[],
  seasons: PublicSeason[],
  showSeasonPrices: boolean
): PriceResolution | null {
  const dayMs = toMidnightMs(date);
  const isoDow = jsWeekdayToIso(date.getDay());

  const matchingRule = rules.find((r) => {
    const start = toMidnightMs(new Date(r.startDate));
    const end = toMidnightMs(new Date(r.endDate));
    const inRange = dayMs >= start && dayMs < end;
    if (!inRange) return false;
    if (r.daysOfWeek.length === 0) return true;
    return r.daysOfWeek.includes(isoDow);
  });

  if (matchingRule) {
    return {
      price: matchingRule.pricePerNight,
      source: "rule",
      label: matchingRule.label,
    };
  }

  if (showSeasonPrices) {
    const season = seasons.find((s) => {
      const start = toMidnightMs(new Date(s.startDate));
      const end = toMidnightMs(new Date(s.endDate));
      return dayMs >= start && dayMs < end;
    });
    if (season) {
      return { price: season.pricePerNight, source: "season", label: season.name };
    }
  }

  return null;
}
