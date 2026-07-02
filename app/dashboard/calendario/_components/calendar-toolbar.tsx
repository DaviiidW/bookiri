"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, CalendarDays, AlignLeft, BarChart2 } from "lucide-react";
import {
  CalendarView,
  CalendarProperty,
  formatMonthLabel,
} from "../_types";

interface CalendarToolbarProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  properties: CalendarProperty[];
  selectedPropertyId: string | null;
  onPropertyChange: (id: string | null) => void;
}

const VIEW_OPTIONS: { key: CalendarView; label: string; icon: React.ReactNode }[] = [
  { key: "month", label: "Mes", icon: <CalendarDays className="w-3.5 h-3.5" /> },
  { key: "gantt", label: "Gantt", icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { key: "list", label: "Lista", icon: <AlignLeft className="w-3.5 h-3.5" /> },
];

function PropertySelect({
  properties,
  selectedPropertyId,
  onPropertyChange,
}: {
  properties: CalendarProperty[];
  selectedPropertyId: string | null;
  onPropertyChange: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const options = [{ id: null as string | null, name: "Todas las viviendas" }, ...properties];
  const selectedLabel = options.find((o) => o.id === selectedPropertyId)?.name ?? "Todas las viviendas";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between gap-2 min-w-[180px] text-xs bg-white border border-zinc-200 text-zinc-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 min-w-full bg-white border border-zinc-200 rounded-lg shadow-lg p-1.5 z-50">
          {options.map((opt) => (
            <button
              key={opt.id ?? ""}
              type="button"
              onClick={() => {
                onPropertyChange(opt.id);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-xs whitespace-nowrap cursor-pointer transition-colors
                ${opt.id === selectedPropertyId
                  ? "bg-zinc-200 text-zinc-900 font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100"
                }`}
            >
              {opt.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CalendarToolbar({
  view,
  onViewChange,
  currentDate,
  onPrev,
  onNext,
  onToday,
  properties,
  selectedPropertyId,
  onPropertyChange,
}: CalendarToolbarProps) {
  const periodLabel = formatMonthLabel(currentDate);

  const showNav = view !== "list";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 flex-wrap">
        {showNav && (
          <>
            <button
              onClick={onPrev}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="px-3 py-1.5 text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-750 rounded-lg transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={onNext}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        <h2 className="text-sm font-bold text-zinc-800 capitalize ml-1">{periodLabel}</h2>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <PropertySelect
          properties={properties}
          selectedPropertyId={selectedPropertyId}
          onPropertyChange={onPropertyChange}
        />

        <div className="flex items-center bg-zinc-100 border border-zinc-200 rounded-lg p-0.5">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onViewChange(opt.key)}
              title={opt.label}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer
                ${view === opt.key
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60"
                }`}
            >
              {opt.icon}
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
