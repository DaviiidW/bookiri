"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Season } from "./season-card";
import { formatShortDate } from "@/app/dashboard/calendario/_types";

interface SeasonTableProps {
  seasons: Season[];
  onEdit: (season: Season) => void;
  onDelete: (season: Season) => void;
}

export default function SeasonTable({ seasons, onEdit, onDelete }: SeasonTableProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getStatus = (season: Season) => {
    const start = new Date(season.startDate);
    const end = new Date(season.endDate);
    if (start <= today && today < end) return "active";
    if (end <= today) return "past";
    return "upcoming";
  };

  const StatusBadge = ({ season }: { season: Season }) => {
    const status = getStatus(season);
    if (status === "active") return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40">
        Activa
      </span>
    );
    if (status === "past") return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-500">
        Pasada
      </span>
    );
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-900/40">
        Próxima
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800/60 overflow-x-auto">
      <table className="w-full min-w-[750px] text-xs">
        <thead className="bg-slate-950/60">
          <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            <th className="px-4 py-3 text-left">Temporada</th>
            <th className="px-4 py-3 text-left">Vivienda</th>
            <th className="px-4 py-3 text-left">Fecha inicio</th>
            <th className="px-4 py-3 text-left">Fecha fin</th>
            <th className="px-4 py-3 text-right">€/noche</th>
            <th className="px-4 py-3 text-center">Mín. noches</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/40">
          {seasons.map((season) => (
            <tr
              key={season.id}
              className="hover:bg-slate-900/30 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: season.color }}
                  />
                  <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                    {season.name}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: season.property.color }}
                  />
                  <span className="text-slate-400 truncate max-w-[120px]">
                    {season.property.name}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-slate-400">{formatShortDate(season.startDate)}</td>
              <td className="px-4 py-3 text-slate-400">{formatShortDate(season.endDate)}</td>
              <td className="px-4 py-3 text-right font-semibold text-slate-200">{season.pricePerNight}€</td>
              <td className="px-4 py-3 text-center text-slate-400">{season.minimumStayNights}</td>
              <td className="px-4 py-3 text-center"><StatusBadge season={season} /></td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(season)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Editar temporada"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(season)}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer"
                    title="Eliminar temporada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
