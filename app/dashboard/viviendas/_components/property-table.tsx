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
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
          <thead className="bg-zinc-50 uppercase tracking-wider font-bold text-zinc-500 border-b border-zinc-200">
            <tr>
              <th className="px-6 py-4">Nombre de la Vivienda</th>
              <th className="px-6 py-4">Color</th>
              <th className="px-6 py-4">Capacidad</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Reservas Futuras</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-medium text-zinc-700">
            {properties.map((p) => (
              <Fragment key={p.id}>
                <tr
                  onClick={() => router.push(`/dashboard/viviendas/${p.id}`)}
                  className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4 font-bold text-zinc-900 max-w-[200px] sm:max-w-none truncate sm:whitespace-normal group-hover:text-indigo-600 transition-colors">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => onToggleExpand(e, p.id)}
                        className="p-1 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer select-none"
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
                      className="w-3.5 h-3.5 rounded-full border border-zinc-200"
                      style={{ backgroundColor: p.color }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-zinc-700">{p.maxGuests} huéspedes</span>
                  </td>
                  <td className="px-6 py-4">
                    {p.isBookedNow ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Ocupado
                      </span>
                    ) : p.isAvailableNow ? (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Disponible
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                        No disponible
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-zinc-700 font-bold">{p.futureBookingsCount}</span>
                      {p.nextBooking && (
                        <span className="text-[9px] text-zinc-400 mt-0.5 truncate max-w-[120px]">
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
                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(p);
                        }}
                        className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
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
                    className="bg-zinc-50 text-zinc-600 text-[10px]"
                  >
                    <td colSpan={6} className="px-6 py-3 border-t border-zinc-200 bg-zinc-50">
                      <div className="flex flex-wrap gap-4 items-center">
                        <span className="font-bold text-zinc-500 uppercase tracking-wider text-[9px]">Periodos de disponibilidad:</span>
                        {p.availabilityPeriods.length === 0 ? (
                          <span className="italic text-zinc-400">Sin periodos configurados</span>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {[...p.availabilityPeriods]
                              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                              .map((period) => (
                                <span
                                  key={period.id}
                                  className="px-2.5 py-1 rounded bg-white border border-zinc-200 font-medium"
                                >
                                  {period.description || "Disponible"}: <strong className="text-zinc-700 font-mono text-[9px]">{formatDateSimple(period.startDate)} al {formatDateSimple(period.endDate)}</strong>
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
