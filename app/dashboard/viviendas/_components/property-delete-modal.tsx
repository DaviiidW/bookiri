"use client";

import { useState, useEffect, useCallback } from "react";
import { X, AlertTriangle, Calendar, Loader2 } from "lucide-react";

interface Property {
  id: string;
  name: string;
  color: string;
  maxGuests: number;
}

interface Booking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
}

interface PropertyDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property: Property | null;
}

export default function PropertyDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  property,
}: PropertyDeleteModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [futureBookings, setFutureBookings] = useState<Booking[]>([]);
  const [hasFutureBookings, setHasFutureBookings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkFutureBookings = useCallback(async () => {
    if (!property) return;
    setIsChecking(true);
    setError(null);
    try {
      const response = await fetch(`/api/properties/${property.id}?checkOnly=true`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.status === 409 && data.requireConfirmation) {
        setFutureBookings(data.bookings || []);
        setHasFutureBookings(true);
      } else if (response.ok) {
        setFutureBookings([]);
        setHasFutureBookings(false);
      } else {
        setError(data.error || "Error al verificar las reservas de la vivienda.");
      }
    } catch (err) {
      setError("Error de conexión al verificar reservas.");
      console.error("Error checking bookings:", err);
    } finally {
      setIsChecking(false);
    }
  }, [property]);

  useEffect(() => {
    if (isOpen && property) {
      checkFutureBookings();
    } else {
      setFutureBookings([]);
      setHasFutureBookings(false);
      setError(null);
    }
  }, [isOpen, property, checkFutureBookings]);

  if (!isOpen || !property) return null;

  const handleDelete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = `/api/properties/${property.id}${hasFutureBookings ? "?force=true" : ""}`;
      const response = await fetch(url, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Ocurrió un error al intentar eliminar la vivienda.");
      }
    } catch (err) {
      setError("Error de conexión al intentar eliminar la vivienda.");
      console.error("Error deleting property:", err);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
          disabled={isLoading || isChecking}
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-zinc-900 mb-3">
          ¿Eliminar Vivienda?
        </h3>

        {isChecking ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs">Comprobando reservas futuras...</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {hasFutureBookings ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-bold">¡Atención! Existen reservas futuras</p>
                      <p className="leading-relaxed">
                        Esta vivienda tiene las siguientes reservas activas en el futuro. Si continúas, <strong>todas estas reservas se eliminarán</strong> permanentemente. Las reservas del histórico no serán afectadas.
                      </p>
                    </div>
                  </div>

                  <div className="border border-zinc-200 rounded-xl bg-zinc-50 max-h-48 overflow-y-auto divide-y divide-zinc-200">
                    {futureBookings.map((booking) => (
                      <div key={booking.id} className="p-3 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-zinc-800">{booking.guestName}</p>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {formatDate(booking.checkInDate)} al {formatDate(booking.checkOutDate)}
                            </span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-red-100 border border-red-200 text-red-700 text-[9px] uppercase font-bold tracking-wider">
                          Afectada
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-500 text-center italic">
                    ¿Estás seguro de que deseas forzar la eliminación de la vivienda y cancelar las reservas anteriores?
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-zinc-700 leading-relaxed">
                    ¿Estás seguro de que deseas eliminar la vivienda <strong className="text-zinc-900">&quot;{property.name}&quot;</strong>?
                  </p>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Se eliminarán de forma permanente las temporadas y configuraciones de disponibilidad asociadas. Las reservas históricas de esta vivienda se conservarán intactas para mantener la trazabilidad de tu negocio.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 justify-end pt-4 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[100px] bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : hasFutureBookings ? (
                    "Forzar Eliminación"
                  ) : (
                    "Confirmar"
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
