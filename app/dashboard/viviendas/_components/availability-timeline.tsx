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
      <div className="py-8 text-center border border-dashed border-zinc-300 rounded-2xl bg-zinc-50 text-zinc-500">
        <Clock className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
        <p className="text-sm font-medium">No hay periodos de disponibilidad configurados.</p>
        <p className="text-xs text-zinc-400 mt-1">La vivienda no estará disponible para recibir reservas.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-zinc-200 ml-4 pl-6 space-y-6 py-2">
      {sortedPeriods.map((period, index) => {
        const originalIndex = periods.findIndex(
          p => p.startDate === period.startDate && p.endDate === period.endDate && p.description === period.description
        );
        const nights = calculateNights(period.startDate, period.endDate);

        return (
          <div key={index} className="relative group animate-in fade-in duration-200">
            <div className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white bg-indigo-500 ring-4 ring-indigo-100" />

            <div className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-2xl p-4 transition-all duration-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-zinc-800">
                    {period.description?.trim() || "Periodo de disponibilidad"}
                  </h4>
                </div>

                <div className="flex items-center gap-2 text-zinc-500 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>
                    Del <strong className="text-zinc-700">{formatDate(period.startDate)}</strong> al <strong className="text-zinc-700">{formatDate(period.endDate)}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center">
                <button
                  onClick={() => onEdit(period, originalIndex)}
                  className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                  title="Editar periodo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(originalIndex)}
                  className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
