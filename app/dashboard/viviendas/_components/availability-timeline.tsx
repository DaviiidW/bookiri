"use client";

import { Calendar, Clock, Edit2, Trash2 } from "lucide-react";

interface Period {
  id?: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface AvailabilityTimelineProps {
  periods: Period[];
  onEdit: (period: Period, index: number) => void;
  onDelete: (index: number) => void;
}

export default function AvailabilityTimeline({
  periods,
  onEdit,
  onDelete,
}: AvailabilityTimelineProps) {
  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const calculateNights = (startStr: string, endStr: string) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (e) {
      return 0;
    }
  };

  if (periods.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/20 text-slate-500">
        <Clock className="w-8 h-8 mx-auto text-slate-650 mb-3" />
        <p className="text-sm font-medium">No hay periodos de disponibilidad configurados.</p>
        <p className="text-xs text-slate-550 mt-1">La vivienda no estará disponible para recibir reservas.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6 py-2">
      {sortedPeriods.map((period, index) => {
        const originalIndex = periods.findIndex(
          p => p.startDate === period.startDate && p.endDate === period.endDate && p.description === period.description
        );
        const nights = calculateNights(period.startDate, period.endDate);

        return (
          <div key={index} className="relative group animate-in fade-in duration-200">
            <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-slate-950 bg-indigo-500 ring-4 ring-indigo-950/40" />

            <div className="bg-slate-900/40 hover:bg-slate-900/60 border border-slate-850 hover:border-slate-800 rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-100">
                    {period.description?.trim() || "Periodo de disponibilidad"}
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-900/40 rounded-full">
                    {nights} {nights === 1 ? "noche" : "noches"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    Del <strong className="text-slate-200">{formatDate(period.startDate)}</strong> al <strong className="text-slate-200">{formatDate(period.endDate)}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => onEdit(period, originalIndex)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Editar periodo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(originalIndex)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar periodo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
