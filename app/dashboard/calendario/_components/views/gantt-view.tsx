"use client";

import { useMemo } from "react";
import {
  CalendarProperty,
  CalendarBooking,
  getDaysInMonth,
  toMidnightMs,
  isDayAvailable,
  formatShortDate,
  getNights,
} from "../../_types";

interface GanttViewProps {
  currentDate: Date;
  properties: CalendarProperty[];
  onSelectBooking?: (booking: CalendarBooking) => void;
}

export default function GanttView({ currentDate, properties, onSelectBooking }: GanttViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const todayIndex = days.findIndex((d) => d.getTime() === today.getTime());

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div
          className="grid gap-px mb-1"
          style={{ gridTemplateColumns: `140px repeat(${days.length}, minmax(28px, 1fr))` }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-2 py-2">
            Vivienda
          </div>
          {days.map((day, i) => {
            const isToday = i === todayIndex;
            return (
              <div
                key={i}
                className={`text-center text-[9px] font-bold py-1.5 rounded-sm
                  ${isToday ? "bg-indigo-500 text-white" : "text-zinc-500 bg-zinc-100"}
                `}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>

        {properties.map((property) => {
          return (
            <div key={property.id} className="mb-1">
              <div
                className="grid gap-px bg-zinc-200/50 rounded-lg overflow-hidden"
                style={{ gridTemplateColumns: `140px repeat(${days.length}, minmax(28px, 1fr))` }}
              >
                <div className="flex items-center gap-2 px-2 py-2 bg-zinc-50 rounded-l-lg">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: property.color }}
                  />
                  <span className="text-xs font-semibold text-zinc-800 truncate">
                    {property.name}
                  </span>
                </div>

                {days.map((day, di) => {
                  const available = isDayAvailable(day, property.availabilityPeriods);
                  const isToday = di === todayIndex;

                  return (
                    <div
                      key={di}
                      className={`relative h-10
                        ${!available ? "bg-zinc-200" : "bg-white"}
                        ${isToday ? "bg-indigo-50/50" : ""}
                        ${di === days.length - 1 ? "rounded-r-lg" : ""}
                      `}
                    >
                      {isToday && (
                        <div className="absolute inset-0 border-l-2 border-indigo-500/50 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="relative -mt-10 h-10 pointer-events-none">
                <div
                  className="absolute inset-y-0 right-0"
                  style={{ left: "140px" }}
                >
                  {property.bookings.map((booking) => {
                    const checkIn = toMidnightMs(new Date(booking.checkInDate));
                    const checkOut = toMidnightMs(new Date(booking.checkOutDate));
                    const firstDay = toMidnightMs(days[0]);
                    const lastDay = toMidnightMs(days[days.length - 1]);

                    if (checkOut < firstDay || checkIn > lastDay) return null;

                    const clampedStart = Math.max(checkIn, firstDay);
                    const clampedEnd = Math.min(checkOut + 86400000, lastDay + 86400000);

                    const startDayIndex = days.findIndex(
                      (d) => toMidnightMs(d) === clampedStart
                    );
                    const nights = Math.round((clampedEnd - clampedStart) / 86400000);

                    if (startDayIndex < 0 || nights <= 0) return null;

                    const totalDays = days.length;
                    const leftPct = (startDayIndex / totalDays) * 100;
                    const widthPct = (nights / totalDays) * 100;

                    return (
                      <div
                        key={booking.id}
                        className="absolute top-1.5 bottom-1.5 rounded-md flex items-center px-2 overflow-hidden pointer-events-auto cursor-pointer hover:scale-[1.02] transition-transform"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          backgroundColor: `${property.color}15`,
                          border: `1px solid ${property.color}50`,
                        }}
                        title={`${booking.guestName} · ${formatShortDate(booking.checkInDate)} – ${formatShortDate(booking.checkOutDate)} (${getNights(booking.checkInDate, booking.checkOutDate)} noches)`}
                        onClick={() => onSelectBooking?.(booking)}
                      >
                        <span
                          className="text-[9px] font-bold truncate"
                          style={{ color: property.color }}
                        >
                          {booking.guestName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {properties.length === 0 && (
          <div className="text-center py-12 text-zinc-400 text-sm">
            No hay viviendas para mostrar
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-zinc-200 mt-3">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <span className="w-3 h-2 rounded-sm bg-zinc-200 border border-zinc-300" />
            No disponible
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
            <span className="w-3 h-2 rounded-sm bg-white border border-zinc-200" />
            Disponible
          </div>
          {properties.map((p) => (
            <div key={p.id} className="flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span className="w-3 h-2 rounded-sm" style={{ backgroundColor: `${p.color}20`, border: `1px solid ${p.color}50` }} />
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
