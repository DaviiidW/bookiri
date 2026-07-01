"use client";

import { useMemo } from "react";
import type { PublicProperty, PriceResolution } from "../_types";
import {
  getDaysInMonth,
  getDayStatus,
  getPriceForDay,
  toMidnightMs,
} from "../_types";

interface Props {
  currentDate: Date;
  property: PublicProperty;
  showPrice: boolean;
  showSeasonPrices: boolean;
}

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function DayCell({
  date,
  isCurrentMonth,
  property,
  showPrice,
  showSeasonPrices,
}: {
  date: Date;
  isCurrentMonth: boolean;
  property: PublicProperty;
  showPrice: boolean;
  showSeasonPrices: boolean;
}) {
  const status = isCurrentMonth ? getDayStatus(date, property) : null;

  const resolution: PriceResolution | null =
    isCurrentMonth && showPrice && status === "available"
      ? getPriceForDay(date, property.priceRules, property.seasons, showSeasonPrices)
      : null;

  const dayNum = date.getDate();

  const statusStyles: Record<string, string> = {
    available: "bg-emerald-950/40 border-emerald-800/30 text-emerald-300",
    occupied: "bg-slate-800/60 border-slate-700/40 text-slate-500 opacity-60",
    unavailable: "bg-red-950/30 border-red-900/30 text-red-500/60 opacity-60",
    past: "opacity-30",
  };

  const baseStyle = status ? statusStyles[status] : "opacity-20";

  return (
    <div
      className={`relative rounded-xl border p-1.5 min-h-[56px] flex flex-col items-center transition-all ${
        isCurrentMonth ? baseStyle : "border-transparent opacity-10"
      }`}
    >
      <span className="text-xs font-semibold leading-none mb-0.5">{dayNum}</span>

      {resolution?.source === "rule" && (
        <span className="text-[9px] font-bold text-emerald-400/90 leading-tight text-center">
          {formatPrice(resolution.price)}
        </span>
      )}

      {resolution?.source === "season" && (
        <span className="text-[9px] font-semibold text-sky-400/80 leading-tight text-center">
          {formatPrice(resolution.price)}
        </span>
      )}

      {status === "occupied" && (
        <span className="text-[9px] text-slate-500 leading-tight">Ocupado</span>
      )}
    </div>
  );
}

export default function PublicMonthView({
  currentDate,
  property,
  showPrice,
  showSeasonPrices,
}: Props) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const firstWeekday = daysInMonth[0].getDay();
  const paddingStart = firstWeekday === 0 ? 6 : firstWeekday - 1;
  const totalCells = Math.ceil((paddingStart + daysInMonth.length) / 7) * 7;
  const trailingCount = totalCells - paddingStart - daysInMonth.length;

  const leadingDays = Array.from({ length: paddingStart }, (_, i) =>
    new Date(year, month, -(paddingStart - i - 1))
  );
  const trailingDays = Array.from({ length: trailingCount }, (_, i) =>
    new Date(year, month + 1, i + 1)
  );
  const gridDays = [...leadingDays, ...daysInMonth, ...trailingDays];

  const activeRulesThisMonth = useMemo(() => {
    if (!showPrice) return [];
    const monthStart = toMidnightMs(new Date(year, month, 1));
    const monthEnd = toMidnightMs(new Date(year, month + 1, 0));
    return property.priceRules.filter((r) => {
      const start = toMidnightMs(new Date(r.startDate));
      const end = toMidnightMs(new Date(r.endDate));
      return start <= monthEnd && end >= monthStart;
    });
  }, [property.priceRules, year, month, showPrice]);

  const activeSeasonsThisMonth = useMemo(() => {
    if (!showPrice || !showSeasonPrices) return [];
    const monthStart = toMidnightMs(new Date(year, month, 1));
    const monthEnd = toMidnightMs(new Date(year, month + 1, 0));
    return property.seasons.filter((s) => {
      const start = toMidnightMs(new Date(s.startDate));
      const end = toMidnightMs(new Date(s.endDate));
      return start <= monthEnd && end >= monthStart;
    });
  }, [property.seasons, year, month, showPrice, showSeasonPrices]);

  const DOW_LABELS: Record<number, string> = {
    1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S", 7: "D",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-1">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((date, i) => (
          <DayCell
            key={i}
            date={date}
            isCurrentMonth={date.getMonth() === month}
            property={property}
            showPrice={showPrice}
            showSeasonPrices={showSeasonPrices}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600/70" />
          Disponible
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
          Ocupado
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-red-900/70" />
          No disponible
        </div>
      </div>
    </div>
  );
}
