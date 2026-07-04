"use client";

import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  BookmarkCheck,
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

interface PropertyCardProps {
  property: Property;
  isExpanded: boolean;
  onToggleExpand: (e: React.MouseEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function PropertyCard({
  property,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: PropertyCardProps) {
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
    <div
      onClick={() => router.push(`/dashboard/viviendas/${property.id}`)}
      className="bg-white hover:bg-zinc-50 border border-zinc-200 rounded-2xl p-6 shadow-sm transition-all duration-200 flex flex-col justify-between cursor-pointer group hover:scale-[1.01] hover:shadow-md hover:border-zinc-300"
      style={{ borderLeftWidth: "4px", borderLeftColor: property.color }}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-lg text-zinc-900 leading-tight break-words group-hover:text-indigo-600 transition-colors">
            {property.name}
          </h3>
          <div
            className="w-3.5 h-3.5 rounded-full border border-zinc-200 flex-shrink-0"
            style={{ backgroundColor: property.color }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {property.isBookedNow ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700">
              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ocupado</span>
            </span>
          ) : property.isAvailableNow ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Disponible</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-600">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
              <span>No Disponible</span>
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center gap-2 text-zinc-500">
            <Users className="w-4 h-4 text-zinc-400" />
            <span>Capacidad: <strong className="text-zinc-700">{property.maxGuests} huéspedes</strong></span>
          </div>

          <div className="flex items-center gap-2 text-zinc-500">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>
              Reservas futuras: <strong className="text-zinc-700">{property.futureBookingsCount}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onToggleExpand}
          className="w-full mt-2 flex items-center justify-between px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300 rounded-xl text-zinc-500 hover:text-zinc-800 transition-all text-[10px] font-semibold cursor-pointer select-none"
        >
          <span>Vista rápida de disponibilidad</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        {isExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-3 border border-zinc-200 bg-zinc-50 rounded-xl space-y-2 text-[10px] max-h-32 overflow-y-auto animate-in slide-in-from-top-1 duration-150"
          >
            {property.availabilityPeriods.length === 0 ? (
              <p className="text-zinc-400 text-center italic py-1">Sin periodos configurados</p>
            ) : (
              [...property.availabilityPeriods]
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((period) => (
                  <div key={period.id} className="flex justify-between items-center text-zinc-500">
                    <span className="font-semibold truncate max-w-[50%]">
                      {period.description || "Disponible"}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400">
                      {formatDateSimple(period.startDate)} al {formatDateSimple(period.endDate)}
                    </span>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-6 border-t border-zinc-100">
        <div className="text-[10px] text-zinc-500 leading-relaxed max-w-[70%] truncate">
          {property.nextBooking ? (
            <span>
              Siguiente: <strong className="text-zinc-700">{formatDate(property.nextBooking.checkInDate)}</strong> ({property.nextBooking.guestName})
            </span>
          ) : (
            <span className="text-zinc-400 italic">Sin reservas futuras</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
            title="Editar vivienda"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Eliminar vivienda"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
