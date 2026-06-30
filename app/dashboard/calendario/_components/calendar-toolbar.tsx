"use client";

import { ChevronLeft, ChevronRight, CalendarDays, AlignLeft, BarChart2 } from "lucide-react";
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
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={onToday}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Hoy
            </button>
            <button
              onClick={onNext}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        <h2 className="text-sm font-bold text-white capitalize ml-1">{periodLabel}</h2>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={selectedPropertyId ?? ""}
          onChange={(e) => onPropertyChange(e.target.value || null)}
          className="text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">Todas las viviendas</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          {VIEW_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onViewChange(opt.key)}
              title={opt.label}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer
                ${view === opt.key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
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
