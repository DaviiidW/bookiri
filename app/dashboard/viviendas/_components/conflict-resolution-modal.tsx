"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Calendar, Check, Trash2, Edit2, AlertCircle } from "lucide-react";

interface Period {
  id?: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface AffectedBooking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  propertyName: string;
  type?: "total" | "parcial";
}

interface BookingDecision {
  bookingId: string;
  action: "keep" | "delete";
  checkInDate: string;
  checkOutDate: string;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (decisions: BookingDecision[]) => void;
  bookings: AffectedBooking[];
  periods: Period[];
  isSaving: boolean;
}

export default function ConflictResolutionModal({
  isOpen,
  onClose,
  onConfirm,
  bookings,
  periods,
  isSaving,
}: ConflictResolutionModalProps) {
  const [decisions, setDecisions] = useState<Record<string, BookingDecision>>({});

  useEffect(() => {
    if (isOpen) {
      const initialDecisions: Record<string, BookingDecision> = {};
      bookings.forEach(b => {
        const formatInputDate = (dateStr: string) => {
          return new Date(dateStr).toISOString().split("T")[0];
        };

        initialDecisions[b.id] = {
          bookingId: b.id,
          action: "delete",
          checkInDate: formatInputDate(b.checkInDate),
          checkOutDate: formatInputDate(b.checkOutDate),
        };
      });
      setDecisions(initialDecisions);
    }
  }, [isOpen, bookings]);

  if (!isOpen) return null;

  const handleActionChange = (bookingId: string, action: "keep" | "delete") => {
    setDecisions(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        action,
      },
    }));
  };

  const toMidnightTime = (dateStr: string) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const isRangeCovered = (checkInStr: string, checkOutStr: string) => {
    if (!checkInStr || !checkOutStr) return false;
    const start = toMidnightTime(checkInStr);
    const end = toMidnightTime(checkOutStr);

    if (isNaN(start) || isNaN(end) || end <= start) return false;

    const normalizedPeriods = periods.map(p => ({
      start: toMidnightTime(p.startDate),
      end: toMidnightTime(p.endDate),
    }));

    for (let day = start; day < end; day += 86400000) {
      const isNightCovered = normalizedPeriods.some(p => {
        return day >= p.start && day < p.end;
      });

      if (!isNightCovered) return false;
    }

    return true;
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(Object.values(decisions));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          disabled={isSaving}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-950/60 border border-amber-850 rounded-xl text-amber-400 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Conflicto con Reservas Existentes
            </h3>
            <p className="text-xs text-slate-450 mt-0.5">
              Se han detectado reservas cuyas fechas caen fuera de los periodos de disponibilidad propuestos.
            </p>
          </div>
        </div>

        <div className="p-4 bg-amber-950/20 border border-amber-850/30 rounded-2xl text-xs text-amber-200 mb-6 leading-relaxed">
          <strong>Acción requerida:</strong> Revisa las <strong>{bookings.length} reservas afectadas</strong> y decide individualmente qué hacer con cada una. No se guardará ningún cambio de disponibilidad hasta que confirmes la resolución de todos los conflictos.
        </div>
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col space-y-6">
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
            {bookings.map((booking) => {
              const decision = decisions[booking.id];
              if (!decision) return null;

              const isTotal = booking.type === "total";

              return (
                <div
                  key={booking.id}
                  className={`p-4 border rounded-2xl transition-all duration-200 bg-slate-950/30 flex flex-col gap-4 ${
                    decision.action === "delete"
                      ? "border-red-900/50 bg-red-950/5"
                      : "border-slate-850"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-slate-200">{booking.guestName}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1.5 text-slate-450 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            Original: {formatDate(booking.checkInDate)} al {formatDate(booking.checkOutDate)}
                          </span>
                        </span>
                        <span className="text-slate-650">·</span>
                        {isTotal ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-950/40 text-red-400 border border-red-900/30">
                            AFECTACIÓN TOTAL
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-950/30 text-amber-400 border border-amber-900/20">
                            AFECTACIÓN PARCIAL
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => handleActionChange(booking.id, "keep")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          decision.action === "keep"
                            ? "bg-slate-800 text-slate-100"
                            : "text-slate-450 hover:text-slate-200"
                        }`}
                      >
                        Mantener
                      </button>
                      <button
                        type="button"
                        onClick={() => handleActionChange(booking.id, "delete")}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                          decision.action === "delete"
                            ? "bg-red-950/80 border border-red-850 text-red-400"
                            : "text-slate-450 hover:text-red-400"
                        }`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {decision.action === "delete" && (
                    <p className="text-[10px] text-red-400 italic">
                      * Esta reserva se cancelará y marcará como eliminada al guardar.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-850 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-450 hover:text-slate-250 transition-colors cursor-pointer"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-xs font-bold bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl transition-colors cursor-pointer flex items-center justify-center min-w-[140px] shadow-lg shadow-indigo-950/20"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
              ) : (
                "Aplicar Resoluciones"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
