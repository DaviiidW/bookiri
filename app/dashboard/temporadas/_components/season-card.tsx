"use client";

import { Calendar, Bed, Euro, Edit2, Trash2 } from "lucide-react";
import { formatShortDate } from "@/app/dashboard/calendario/_types";

export interface Season {
  id: string;
  name: string;
  color: string;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  minimumStayNights: number;
  property: {
    id: string;
    name: string;
    color: string;
  };
}

interface SeasonCardProps {
  season: Season;
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
}

export default function SeasonCard({ season, onEdit, onDelete }: SeasonCardProps) {
  const start = new Date(season.startDate);
  const end = new Date(season.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isActive = start <= today && today < end;
  const isPast = end <= today;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all duration-200 overflow-hidden bg-white hover:bg-zinc-50
        ${isActive ? "border-l-4" : "border-zinc-200"}
      `}
      style={isActive ? { borderLeftColor: season.color } : undefined}
    >
      <div className="h-1 w-full" style={{ backgroundColor: season.color }} />

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: season.color }}
            />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-zinc-900 truncate">{season.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: season.property.color }}
                />
                <span className="text-xs text-zinc-500 truncate">{season.property.name}</span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            {isActive && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Activa
              </span>
            )}
            {isPast && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500">
                Pasada
              </span>
            )}
            {!isActive && !isPast && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Próxima
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Calendar className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
          <span>{formatShortDate(season.startDate)}</span>
          <span className="text-zinc-300">→</span>
          <span>{formatShortDate(season.endDate)}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs">
            <Euro className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-700">{season.pricePerNight}€</span>
            <span className="text-zinc-500">/ noche</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Bed className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-700">{season.minimumStayNights}</span>
            <span className="text-zinc-500">noche{season.minimumStayNights > 1 ? "s" : ""} mín.</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-zinc-100">
          <button
            onClick={() => onEdit(season)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Editar
          </button>
          <button
            onClick={() => onDelete(season)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
