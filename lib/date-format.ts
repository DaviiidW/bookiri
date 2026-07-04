export function toMidnightMs(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function getNights(checkIn: string, checkOut: string): number {
  const a = toMidnightMs(new Date(checkIn));
  const b = toMidnightMs(new Date(checkOut));
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function formatShortDate(date: Date | string, locale = "es-ES"): string {
  return new Date(date).toLocaleDateString(locale, { day: "numeric", month: "short" });
}
