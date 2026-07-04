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
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        Activa
      </span>
    );
    if (status === "past") return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-500">
        Pasada
      </span>
    );
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        Próxima
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-zinc-200 overflow-x-auto">
      <table className="w-full min-w-[750px] text-xs">
        <thead className="bg-zinc-50">
          <tr className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
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
        <tbody className="divide-y divide-zinc-200">
          {seasons.map((season) => (
            <tr
              key={season.id}
              className="hover:bg-zinc-50 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: season.color }}
                  />
                  <span className="font-semibold text-zinc-800 truncate max-w-[140px]">
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
                  <span className="text-zinc-500 truncate max-w-[120px]">
                    {season.property.name}
                  </span>
                </div>
              </td>

              <td className="px-4 py-3 text-zinc-500">{formatShortDate(season.startDate)}</td>
              <td className="px-4 py-3 text-zinc-500">{formatShortDate(season.endDate)}</td>
              <td className="px-4 py-3 text-right font-semibold text-zinc-800">{season.pricePerNight}€</td>
              <td className="px-4 py-3 text-center text-zinc-500">{season.minimumStayNights}</td>
              <td className="px-4 py-3 text-center"><StatusBadge season={season} /></td>

              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onEdit(season)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Editar temporada"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(season)}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
