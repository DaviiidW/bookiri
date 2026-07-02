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
  isSelected?: boolean;
  onSelectDate?: (date: Date) => void;
}

export default function DayCell({
  date,
  isCurrentMonth = true,
  allBookings,
  allPeriods,
  isCompact = false,
  onSelectBooking,
  isSelected = false,
  onSelectDate,
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

  let bgClass = "bg-zinc-50/50";
  if (!available) bgClass = "bg-zinc-100";
  if (hasBookings) bgClass = "bg-white";
  if (!isCurrentMonth) bgClass = "bg-transparent";

  return (
    <div
      onClick={() => isCurrentMonth && onSelectDate?.(date)}
      className={`
        relative flex flex-col min-h-[80px] p-1.5 rounded-lg border transition-all duration-100
        ${isCurrentMonth ? "border-zinc-200" : "border-transparent"}
        ${bgClass}
        ${isToday ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-white" : ""}
        ${isSelected && isCurrentMonth && !isToday ? "ring-2 ring-indigo-400 ring-offset-1 ring-offset-white" : ""}
        ${!isCurrentMonth ? "opacity-30" : "cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30"}
      `}
    >
      <div className="flex items-center justify-between mb-1">
        <span
          className={`
            text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full
            ${isToday ? "bg-indigo-500 text-white" : ""}
            ${isPast && isCurrentMonth && !isToday ? "text-zinc-400" : "text-zinc-700"}
            ${!isCurrentMonth ? "text-zinc-300" : ""}
          `}
        >
          {date.getDate()}
        </span>

        {isCurrentMonth && !hasBookings && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${available ? "bg-emerald-500/60" : "bg-zinc-300"}`}
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
                <span className="text-[9px] text-zinc-400">+{bookings.length - 3}</span>
              )}
            </div>
          ) : (
            <>
              {visibleBookings.map((b) => (
                <BookingChip key={b.id} booking={b} onClick={() => onSelectBooking?.(b)} />
              ))}
              {overflow > 0 && (
                <span className="text-[9px] text-zinc-400 pl-1 mt-0.5">+{overflow} más</span>
              )}
            </>
          )}
        </div>
      )}

      {isCurrentMonth && !available && !hasBookings && (
        <span className="text-[9px] text-zinc-450 mt-auto">No disp.</span>
      )}
    </div>
  );
}
