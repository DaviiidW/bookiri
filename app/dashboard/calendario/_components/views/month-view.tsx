"use client";

import { useMemo } from "react";
import {
  CalendarProperty,
  CalendarBooking,
  CalendarAvailabilityPeriod,
  getDaysInMonth,
  formatMonthLabel,
} from "../../_types";
import DayCell from "../ui/day-cell";

interface MonthViewProps {
  currentDate: Date;
  properties: CalendarProperty[];
  onSelectBooking?: (booking: CalendarBooking) => void;
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
}

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function MonthView({ currentDate, properties, onSelectBooking, selectedDate, onSelectDate }: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const allBookings = useMemo<CalendarBooking[]>(
    () => properties.flatMap((p) => p.bookings),
    [properties]
  );
  const allPeriods = useMemo<CalendarAvailabilityPeriod[]>(
    () => properties.flatMap((p) => p.availabilityPeriods),
    [properties]
  );

  const firstDayOfMonth = daysInMonth[0];
  const firstWeekday = firstDayOfMonth.getDay();
  const paddingStart = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const totalCells = Math.ceil((paddingStart + daysInMonth.length) / 7) * 7;
  const trailingCount = totalCells - paddingStart - daysInMonth.length;

  const trailingDays = Array.from({ length: trailingCount }, (_, i) => {
    const d = new Date(year, month + 1, i + 1);
    return d;
  });
  const leadingDays = Array.from({ length: paddingStart }, (_, i) => {
    const d = new Date(year, month, -(paddingStart - i - 1));
    return d;
  });

  const gridDays = [...leadingDays, ...daysInMonth, ...trailingDays];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((date, i) => {
          const isCurrentMonth = date.getMonth() === month;
          const isSel = selectedDate != null &&
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate();
          return (
            <div key={i} className="hidden sm:block">
              <DayCell
                date={date}
                isCurrentMonth={isCurrentMonth}
                allBookings={allBookings}
                allPeriods={allPeriods}
                onSelectBooking={onSelectBooking}
                isSelected={isSel}
                onSelectDate={onSelectDate}
              />
            </div>
          );
        })}

        {gridDays.map((date, i) => {
          const isCurrentMonth = date.getMonth() === month;
          const isSel = selectedDate != null &&
            date.getFullYear() === selectedDate.getFullYear() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getDate() === selectedDate.getDate();
          return (
            <div key={`m-${i}`} className="block sm:hidden">
              <DayCell
                date={date}
                isCurrentMonth={isCurrentMonth}
                allBookings={allBookings}
                allPeriods={allPeriods}
                onSelectBooking={onSelectBooking}
                isSelected={isSel}
                onSelectDate={onSelectDate}
                isCompact
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
          Disponible
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          No disponible
        </div>
        {properties.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            {p.name}
          </div>
        ))}
      </div>
    </div>
  );
}
