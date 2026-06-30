"use client";

import { CalendarBooking, CalendarAvailabilityPeriod, getBookingsForDay, isDayAvailable } from "../../_types";
import BookingChip from "./booking-chip";

interface DayCellProps {
  date: Date;
  isCurrentMonth?: boolean;
  allBookings: CalendarBooking[];
  allPeriods: CalendarAvailabilityPeriod[];
  isCompact?: boolean;
  onSelectBooking?: (booking: CalendarBooking) => void;
}

export default function DayCell({
  date,
  isCurrentMonth = true,
  allBookings,
  allPeriods,
  isCompact = false,
  onSelectBooking,
}: DayCellProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = date.getTime() === today.getTime();
  const isPast = date < today;

  const bookings = getBookingsForDay(date, allBookings);
  const available = isDayAvailable(date, allPeriods);
  const hasBookings = bookings.length > 0;

  const MAX_VISIBLE = 2;
  const visibleBookings = bookings.slice(0, MAX_VISIBLE);
  const overflow = bookings.length - MAX_VISIBLE;

  let bgClass = "bg-slate-900/20";
  if (!available) bgClass = "bg-slate-950/60";
  if (hasBookings) bgClass = "bg-slate-900/30";
  if (!isCurrentMonth) bgClass = "bg-transparent";

  return (
    <div
      className={`
        relative flex flex-col min-h-[80px] p-1.5 rounded-lg border transition-colors duration-100
        ${isCurrentMonth ? "border-slate-800/60" : "border-transparent"}
        ${bgClass}
        ${isToday ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-slate-950" : ""}
        ${!isCurrentMonth ? "opacity-30" : ""}
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`
            text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
            ${isToday ? "bg-indigo-500 text-white" : ""}
            ${isPast && isCurrentMonth && !isToday ? "text-slate-500" : "text-slate-300"}
            ${!isCurrentMonth ? "text-slate-600" : ""}
          `}
        >
          {date.getDate()}
        </span>

        {isCurrentMonth && !hasBookings && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${available ? "bg-emerald-500/60" : "bg-slate-700"}`}
            title={available ? "Disponible" : "No disponible"}
          />
        )}
      </div>

      {isCurrentMonth && hasBookings && (
        <div className="flex flex-col gap-0.5 mt-0.5">
          {isCompact ? (
            <div className="flex flex-wrap gap-0.5">
              {bookings.slice(0, 3).map((b) => (
                <BookingChip key={b.id} booking={b} compact onClick={() => onSelectBooking?.(b)} />
              ))}
              {bookings.length > 3 && (
                <span className="text-[9px] text-slate-400">+{bookings.length - 3}</span>
              )}
            </div>
          ) : (
            <>
              {visibleBookings.map((b) => (
                <BookingChip key={b.id} booking={b} onClick={() => onSelectBooking?.(b)} />
              ))}
              {overflow > 0 && (
                <span className="text-[9px] text-slate-400 pl-1 mt-0.5">+{overflow} más</span>
              )}
            </>
          )}
        </div>
      )}

      {isCurrentMonth && !available && !hasBookings && (
        <span className="text-[9px] text-slate-600 mt-auto">No disp.</span>
      )}
    </div>
  );
}
