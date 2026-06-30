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
      className="bg-slate-900/40 hover:bg-slate-900/60 border border-slate-900 rounded-2xl p-6 shadow-md transition-all duration-205 flex flex-col justify-between cursor-pointer group hover:scale-[1.01] hover:shadow-lg hover:border-slate-850"
      style={{ borderLeftWidth: "4px", borderLeftColor: property.color }}
    >
      <div className="space-y-4">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-bold text-lg text-white leading-tight break-words group-hover:text-indigo-400 transition-colors">
            {property.name}
          </h3>
          <div
            className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0"
            style={{ backgroundColor: property.color }}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {property.isBookedNow ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-950/30 border border-indigo-900/40 text-indigo-400 border animate-pulse">
              <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ocupado</span>
            </span>
          ) : property.isAvailableNow ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/30 border border-emerald-900/40 text-emerald-400 border">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Disponible</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-950/40 border border-slate-850 text-slate-555 border">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
              <span>No Disponible</span>
            </span>
          )}
        </div>

        <div className="space-y-2 text-xs pt-1">
          <div className="flex items-center gap-2 text-slate-400">
            <Users className="w-4 h-4 text-slate-500" />
            <span>Capacidad: <strong className="text-slate-200">{property.maxGuests} huéspedes</strong></span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span>
              Reservas futuras: <strong className="text-slate-200">{property.futureBookingsCount}</strong>
            </span>
          </div>
        </div>

        <button
          onClick={onToggleExpand}
          className="w-full mt-2 flex items-center justify-between px-3 py-1.5 bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-slate-850 rounded-xl text-slate-400 hover:text-slate-200 transition-all text-[10px] font-semibold cursor-pointer select-none"
        >
          <span>Vista rápida de disponibilidad</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-505" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-505" />
          )}
        </button>

        {isExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-3 border border-slate-900 bg-slate-950/50 rounded-xl space-y-2 text-[10px] max-h-32 overflow-y-auto animate-in slide-in-from-top-1 duration-150"
          >
            {property.availabilityPeriods.length === 0 ? (
              <p className="text-slate-605 text-center italic py-1">Sin periodos configurados</p>
            ) : (
              [...property.availabilityPeriods]
                .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                .map((period) => (
                  <div key={period.id} className="flex justify-between items-center text-slate-400">
                    <span className="font-semibold truncate max-w-[50%]">
                      {period.description || "Disponible"}
                    </span>
                    <span className="font-mono text-[9px] text-slate-505">
                      {formatDateSimple(period.startDate)} al {formatDateSimple(period.endDate)}
                    </span>
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 mt-6 border-t border-slate-900/60">
        <div className="text-[10px] text-slate-450 leading-relaxed max-w-[70%] truncate">
          {property.nextBooking ? (
            <span>
              Siguiente: <strong className="text-slate-350">{formatDate(property.nextBooking.checkInDate)}</strong> ({property.nextBooking.guestName})
            </span>
          ) : (
            <span className="text-slate-555 italic">Sin reservas futuras</span>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Editar vivienda"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
            title="Eliminar vivienda"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
