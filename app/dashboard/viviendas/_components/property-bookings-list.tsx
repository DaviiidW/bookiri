"use client";

import {
  Calendar,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Booking {
  id: string;
  guestName: string;
  guestsTotal: number;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  fullyPaid: boolean;
  depositPaid: boolean;
}

interface PropertyBookingsListProps {
  bookings: Booking[];
  isBookingsLoading: boolean;
  bookingsLimit: number;
  bookingsPage: number;
  bookingsTotalCount: number;
  onLimitChange: (limit: number) => void;
  onPageChange: (page: number) => void;
}

export default function PropertyBookingsList({
  bookings,
  isBookingsLoading,
  bookingsLimit,
  bookingsPage,
  bookingsTotalCount,
  onLimitChange,
  onPageChange,
}: PropertyBookingsListProps) {
  const totalPages = Math.ceil(bookingsTotalCount / bookingsLimit) || 1;

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

  const getBookingStatusBadge = (checkInStr: string, checkOutStr: string) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const start = new Date(checkInStr);
      start.setHours(0, 0, 0, 0);
      const end = new Date(checkOutStr);
      end.setHours(0, 0, 0, 0);

      if (end < today) {
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-zinc-100 text-zinc-500 border border-zinc-200">
            Completada
          </span>
        );
      } else if (start <= today && today <= end) {
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            En Curso
          </span>
        );
      } else {
        return (
          <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Próxima
          </span>
        );
      }
    } catch (e) {
      return null;
    }
  };

  const getPaymentStatusBadge = (fullyPaid: boolean, depositPaid: boolean) => {
    if (fullyPaid) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
          <CreditCard className="w-3 h-3" />
          <span>Pagado</span>
        </span>
      );
    } else if (depositPaid) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-semibold">
          <CreditCard className="w-3 h-3" />
          <span>Señal Pagada</span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold">
          <CreditCard className="w-3 h-3" />
          <span>Pendiente</span>
        </span>
      );
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-900">Futuras reservas de la vivienda</h3>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-zinc-500">Mostrar:</span>
          <select
            value={bookingsLimit}
            onChange={(e) => {
              onLimitChange(parseInt(e.target.value, 10));
            }}
            className="bg-white border border-zinc-200 rounded-lg text-xs text-zinc-700 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </div>
      </div>

      {isBookingsLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <p className="text-[11px]">Cargando reservas...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-zinc-300 rounded-2xl bg-zinc-50 text-zinc-500">
          <Calendar className="w-8 h-8 mx-auto text-zinc-400 mb-3" />
          <p className="text-sm font-medium">Esta vivienda no tiene ninguna reserva registrada.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-zinc-200">
            <table className="min-w-full divide-y divide-zinc-200 text-left text-xs">
              <thead className="bg-zinc-50 uppercase tracking-wider font-bold text-zinc-500">
                <tr>
                  <th className="px-5 py-3">Huésped</th>
                  <th className="px-5 py-3">Fechas</th>
                  <th className="px-5 py-3">Personas</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3">Pago</th>
                  <th className="px-5 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-medium text-zinc-700">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-zinc-900">
                      {booking.guestName}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-700">
                      {formatDate(booking.checkInDate)} al {formatDate(booking.checkOutDate)}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">
                      {booking.guestsTotal} {booking.guestsTotal === 1 ? "huésped" : "huéspedes"}
                    </td>
                    <td className="px-5 py-3.5">
                      {getBookingStatusBadge(booking.checkInDate, booking.checkOutDate)}
                    </td>
                    <td className="px-5 py-3.5">
                      {getPaymentStatusBadge(booking.fullyPaid, booking.depositPaid)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-semibold text-zinc-900">
                      {booking.totalPrice.toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block sm:hidden space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-zinc-900 text-sm">{booking.guestName}</p>
                  <p className="font-mono font-semibold text-zinc-900">
                    {booking.totalPrice.toLocaleString("es-ES", {
                      style: "currency",
                      currency: "EUR",
                    })}
                  </p>
                </div>

                <div className="flex justify-between text-zinc-500 text-[11px]">
                  <span>{formatDate(booking.checkInDate)} al {formatDate(booking.checkOutDate)}</span>
                  <span>{booking.guestsTotal} pers.</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                  {getBookingStatusBadge(booking.checkInDate, booking.checkOutDate)}
                  {getPaymentStatusBadge(booking.fullyPaid, booking.depositPaid)}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
              <p className="text-xs text-zinc-500">
                Mostrando reservas <strong className="text-zinc-700">{(bookingsPage - 1) * bookingsLimit + 1}</strong> a{" "}
                <strong className="text-zinc-700">
                  {Math.min(bookingsPage * bookingsLimit, bookingsTotalCount)}
                </strong>{" "}
                de <strong className="text-zinc-700">{bookingsTotalCount}</strong>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(Math.max(1, bookingsPage - 1))}
                  disabled={bookingsPage === 1}
                  className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-zinc-700 px-2 select-none">
                  Pág. {bookingsPage} de {totalPages}
                </span>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, bookingsPage + 1))}
                  disabled={bookingsPage === totalPages}
                  className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
