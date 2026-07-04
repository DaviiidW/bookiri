"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, Loader2, Calendar, ArrowRight } from "lucide-react";
import { Season } from "./season-card";
import { formatShortDate, getNights } from "@/app/dashboard/calendario/_types";

interface AffectedBooking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  propertyId: string;
  propertyName: string;
  propertyColor: string;
}

interface SeasonDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  season: Season | null;
}

export default function SeasonDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  season,
}: SeasonDeleteModalProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [affectedBookings, setAffectedBookings] = useState<AffectedBooking[]>([]);
  const [error, setError] = useState<string | null>(null);

  const checkAffectedBookings = useCallback(async () => {
    if (!season) return;
    setIsChecking(true);
    setError(null);
    try {
      const res = await fetch(`/api/seasons/${season.id}/affected-bookings`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAffectedBookings(data.affectedBookings || []);
      } else {
        setError(data.error || "Error al comprobar reservas afectadas");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsChecking(false);
    }
  }, [season]);

  useEffect(() => {
    if (isOpen && season) {
      checkAffectedBookings();
    } else {
      setAffectedBookings([]);
      setError(null);
    }
  }, [isOpen, season, checkAffectedBookings]);

  if (!isOpen || !season) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/seasons/${season.id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Error al eliminar la temporada");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasAffected = affectedBookings.length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Eliminar temporada</h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle"
                  style={{ backgroundColor: season.color }}
                />
                {season.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {isChecking ? (
            <div className="flex items-center justify-center py-8 gap-3 text-zinc-500">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-sm">Comprobando reservas afectadas...</span>
            </div>
          ) : (
            <>
              {hasAffected && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                    <p className="text-xs font-bold text-amber-700">
                      La temporada será eliminada.
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-amber-700/80 space-y-1 leading-relaxed">
                      <li>Las reservas conservarán el precio actualmente almacenado.</li>
                      <li>Únicamente dejarán de utilizar dicha temporada para futuras modificaciones o recalculos.</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    {affectedBookings.map((b) => (
                      <div key={b.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                          style={{ backgroundColor: b.propertyColor }}
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-zinc-800">{b.guestName}</span>
                            <span className="text-[10px] text-zinc-400">·</span>
                            <span className="text-[10px] text-zinc-500">{b.propertyName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                            <Calendar className="w-3 h-3" />
                            {formatShortDate(b.checkInDate)}
                            <ArrowRight className="w-2.5 h-2.5" />
                            {formatShortDate(b.checkOutDate)}
                            <span className="text-zinc-300">·</span>
                            <span className="font-semibold text-zinc-500">{getNights(b.checkInDate, b.checkOutDate)} noches</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 flex-shrink-0">{b.totalPrice}€</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasAffected && (
                <p className="text-sm text-zinc-700 leading-relaxed">
                  ¿Estás seguro de que deseas eliminar la temporada{" "}
                  <strong className="text-zinc-900">&quot;{season.name}&quot;</strong>? Esta acción no puede deshacerse.
                </p>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {!isChecking && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none min-w-[140px] justify-center"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Confirmar eliminación"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
