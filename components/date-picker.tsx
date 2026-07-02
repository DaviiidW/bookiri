"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAY_LABELS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];
const MONTH_NAMES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const MONTH_ABBREVIATIONS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const YEARS_BEFORE = 3;
const YEARS_AFTER = 7;

const DEFAULT_TRIGGER_CLASSNAME =
  "w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400";

function parseDateKey(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

export default function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className = "",
  triggerClassName = DEFAULT_TRIGGER_CLASSNAME,
}: DatePickerProps) {
  const selectedDate = useMemo(() => parseDateKey(value), [value]);
  const today = useMemo(() => new Date(), []);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"days" | "months">("days");
  const [visibleYear, setVisibleYear] = useState(() => (selectedDate ?? today).getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(() => (selectedDate ?? today).getMonth());
  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setView("days");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!open) {
      const base = selectedDate ?? today;
      setVisibleYear(base.getFullYear());
      setVisibleMonth(base.getMonth());
      setView("days");
      setExpandedYears({ [base.getFullYear()]: true });
    }
    setOpen((v) => !v);
  };

  const goToPrevMonth = () => {
    if (visibleMonth === 0) {
      setVisibleMonth(11);
      setVisibleYear((y) => y - 1);
    } else {
      setVisibleMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (visibleMonth === 11) {
      setVisibleMonth(0);
      setVisibleYear((y) => y + 1);
    } else {
      setVisibleMonth((m) => m + 1);
    }
  };

  const openMonthView = () => {
    setExpandedYears({ [visibleYear]: true });
    setView("months");
  };

  const toggleYearExpanded = (year: number) => {
    setExpandedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const isDateDisabled = (date: Date) => {
    const key = formatDateKey(date);
    if (min && key < min) return true;
    if (max && key > max) return true;
    return false;
  };

  const handleSelectDay = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange(formatDateKey(date));
    setOpen(false);
    setView("days");
  };

  const handleSelectMonth = (year: number, month: number) => {
    setVisibleYear(year);
    setVisibleMonth(month);
    setView("days");
  };

  const days = useMemo(() => {
    const firstOfMonth = new Date(visibleYear, visibleMonth, 1);
    const startOffset = (firstOfMonth.getDay() + 6) % 7;
    const daysInMonth = new Date(visibleYear, visibleMonth + 1, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const gridStart = new Date(visibleYear, visibleMonth, 1 - startOffset);
    return Array.from({ length: totalCells }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      return date;
    });
  }, [visibleYear, visibleMonth]);

  const years = useMemo(
    () => Array.from({ length: YEARS_BEFORE + YEARS_AFTER + 1 }, (_, i) => visibleYear - YEARS_BEFORE + i),
    [visibleYear]
  );

  const headerLabel = `${capitalize(MONTH_NAMES[visibleMonth])} ${visibleYear}`;
  const displayLabel = selectedDate
    ? selectedDate.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })
    : placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={toggleOpen}
        disabled={disabled}
        className={`${triggerClassName} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className={selectedDate ? "" : "text-zinc-400"}>{displayLabel}</span>
        <CalendarDays className="w-3.5 h-3.5 text-zinc-450 shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 z-50">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => (view === "days" ? openMonthView() : setView("days"))}
              className="flex items-center gap-1 text-sm font-semibold text-zinc-800 cursor-pointer"
            >
              <span>{headerLabel}</span>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform ${view === "months" ? "rotate-180" : ""}`}
              />
            </button>
            {view === "days" && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  className="p-1 rounded-md hover:bg-zinc-100 text-zinc-500 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="p-1 rounded-md hover:bg-zinc-100 text-zinc-500 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {view === "days" ? (
            <>
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} className="text-center text-[11px] font-medium text-zinc-400 py-1">
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {days.map((date) => {
                  const inCurrentMonth = date.getMonth() === visibleMonth;
                  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                  const isToday = isSameDay(date, today);
                  const dayDisabled = isDateDisabled(date);
                  return (
                    <div
                      key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`}
                      className="flex items-center justify-center py-0.5"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectDay(date)}
                        disabled={dayDisabled}
                        className={`relative w-8 h-8 flex items-center justify-center rounded-lg text-xs transition-colors
                          ${isSelected
                            ? "bg-zinc-900 text-white font-semibold"
                            : dayDisabled
                            ? "text-zinc-300 cursor-not-allowed"
                            : inCurrentMonth
                            ? "text-zinc-800 hover:bg-zinc-100 cursor-pointer"
                            : "text-zinc-300 hover:bg-zinc-100 cursor-pointer"
                          }`}
                      >
                        {date.getDate()}
                        {isToday && (
                          <span
                            className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-indigo-500"}`}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="max-h-64 overflow-y-auto pr-1 -mr-1 space-y-1">
              {years.map((year) => {
                const expanded = !!expandedYears[year];
                return (
                  <div key={year}>
                    <button
                      type="button"
                      onClick={() => toggleYearExpanded(year)}
                      className="flex items-center gap-1.5 text-sm font-semibold text-zinc-700 px-1 py-1.5 w-full cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${expanded ? "" : "-rotate-90"}`}
                      />
                      {year}
                    </button>
                    {expanded && (
                      <div className="grid grid-cols-3 gap-1.5 pb-2">
                        {MONTH_ABBREVIATIONS.map((label, month) => {
                          const isSelectedMonth = year === visibleYear && month === visibleMonth;
                          return (
                            <button
                              key={month}
                              type="button"
                              onClick={() => handleSelectMonth(year, month)}
                              className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer
                                ${isSelectedMonth
                                  ? "bg-zinc-900 text-white border-zinc-900"
                                  : "border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                                }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
