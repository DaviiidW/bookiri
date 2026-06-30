"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  ShieldAlert,
  BookmarkCheck,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  color: string;
  maxGuests: number;
  isAvailableNow: boolean;
  isBookedNow: boolean;
  nextBooking: {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  } | null;
  futureBookingsCount: number;
}

interface PropertyDetailHeaderProps {
  property: Property;
}

export default function PropertyDetailHeader({
  property,
}: PropertyDetailHeaderProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      <Link
        href="/dashboard/viviendas"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Viviendas</span>
      </Link>

      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
            style={{ backgroundColor: property.color }}
          />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
              {property.name}
            </h1>
            <div className="flex flex-wrap gap-2 items-center mt-2.5">
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

              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                Max: <strong>{property.maxGuests} huéspedes</strong>
              </span>

              <span className="text-slate-500 text-xs">•</span>
              <span className="text-slate-400 text-xs">
                Reservas futuras: <strong>{property.futureBookingsCount}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 border-t border-slate-855 md:border-t-0 pt-4 md:pt-0">
          {property.nextBooking ? (
            <div className="space-y-1">
              <p className="text-slate-450 uppercase tracking-wider text-[9px] font-bold">Próxima Entrada</p>
              <p className="text-slate-200 font-semibold">{property.nextBooking.guestName}</p>
              <p className="text-indigo-400">{formatDate(property.nextBooking.checkInDate)}</p>
            </div>
          ) : (
            <span className="text-slate-555 italic">Sin reservas futuras programadas</span>
          )}
        </div>
      </div>
    </div>
  );
}
