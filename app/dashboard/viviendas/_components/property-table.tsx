"use client";

import { Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  color: string;
  maxGuests: number;
  availabilityPeriods: {
    id: string;
    startDate: string;
    endDate: string;
    description: string | null;
  }[];
  isAvailableNow: boolean;
  isBookedNow: boolean;
  nextBooking: {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  } | null;
  futureBookingsCount: number;
}

interface PropertyTableProps {
  properties: Property[];
  expandedProps: Record<string, boolean>;
  onToggleExpand: (e: React.MouseEvent, id: string) => void;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
}

export default function PropertyTable({
  properties,
  expandedProps,
  onToggleExpand,
  onEdit,
  onDelete,
}: PropertyTableProps) {
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatDateSimple = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-900 text-left text-xs">
          <thead className="bg-slate-950/60 uppercase tracking-wider font-bold text-slate-450 border-b border-slate-900">
            <tr>
              <th className="px-6 py-4">Nombre de la Vivienda</th>
              <th className="px-6 py-4">Color</th>
              <th className="px-6 py-4">Capacidad</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Reservas Futuras</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 font-medium text-slate-300">
            {properties.map((p) => (
              <Fragment key={p.id}>
                <tr
                  onClick={() => router.push(`/dashboard/viviendas/${p.id}`)}
                  className="hover:bg-slate-900/20 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-bold text-white max-w-[200px] sm:max-w-none truncate sm:whitespace-normal group-hover:text-indigo-400 transition-colors">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => onToggleExpand(e, p.id)}
                        className="p-1 rounded-md hover:bg-slate-800 text-slate-450 hover:text-white transition-colors cursor-pointer select-none"
                        title="Ver periodos de disponibilidad"
                      >
                        {expandedProps[p.id] ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/10"
                      style={{ backgroundColor: p.color }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-200">{p.maxGuests} huéspedes</span>
                  </td>
                  <td className="px-6 py-4">
                    {p.isBookedNow ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/40 text-indigo-400 border border-indigo-900/30 animate-pulse">
                        Ocupado
                      </span>
                    ) : p.isAvailableNow ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950/50 text-slate-550 border border-slate-900">
                        No disponible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-200 font-bold">{p.futureBookingsCount}</span>
                      {p.nextBooking && (
                        <span className="text-[9px] text-slate-450 mt-0.5 truncate max-w-[120px]">
                          Sig: {formatDate(p.nextBooking.checkInDate)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(p);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(p);
                        }}
                        className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-md transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>

                {expandedProps[p.id] && (
                  <tr
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-950/20 text-slate-350 text-[10px]"
                  >
                    <td colSpan={6} className="px-6 py-3 border-t border-slate-900 bg-slate-950/30">
                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="font-bold text-slate-450 uppercase tracking-wider text-[9px]">Periodos de disponibilidad:</span>
                        {p.availabilityPeriods.length === 0 ? (
                          <span className="italic text-slate-555">Sin periodos configurados</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {[...p.availabilityPeriods]
                              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                              .map((period) => (
                                <span
                                  key={period.id}
                                  className="px-2.5 py-1 rounded bg-slate-900 border border-slate-850 font-medium"
                                >
                                  {period.description || "Disponible"}: <strong className="text-slate-200 font-mono text-[9px]">{formatDateSimple(period.startDate)} al {formatDateSimple(period.endDate)}</strong>
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
