"use client";

import { CalendarBooking, CalendarProperty, getBookingsForDay, isDayAvailable, formatShortDate, getNights } from "../../_types";
import { Users, ArrowRight, Euro, CheckCircle2, Clock } from "lucide-react";

interface DayDetailPanelProps {
  selectedDate: Date;
  properties: CalendarProperty[];
  onSelectBooking: (booking: CalendarBooking) => void;
}

export default function DayDetailPanel({ selectedDate, properties, onSelectBooking }: DayDetailPanelProps) {
  const allBookings = properties.flatMap((p) => p.bookings);
  const allPeriods = properties.flatMap((p) => p.availabilityPeriods);

  const bookings = getBookingsForDay(selectedDate, allBookings);
  const available = isDayAvailable(selectedDate, allPeriods);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday = selectedDate.getTime() === today.getTime();

  const formattedDate = selectedDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const propertyColor = (id: string) => properties.find((p) => p.id === id)?.color ?? "#6366f1";

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-extrabold flex-shrink-0 ${
              isToday ? "bg-indigo-500 text-white" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {selectedDate.getDate()}
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-800 capitalize">{formattedDate}</p>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wide">
              {bookings.length === 0
                ? available
                  ? "Sin reservas · disponible"
                  : "Sin reservas · no disponible"
                : `${bookings.length} reserva${bookings.length > 1 ? "s" : ""} activa${bookings.length > 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-semibold">
          {bookings.length > 0 ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150">
              <Users className="w-3 h-3" />
              Ocupado
            </span>
          ) : available ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" />
              Disponible
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500 border border-zinc-200">
              No disponible
            </span>
          )}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-zinc-400">
          <Clock className="w-7 h-7 text-zinc-300" />
          <p className="text-xs">No hay reservas para este día</p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-100">
          {bookings.map((booking) => {
            const color = propertyColor(booking.propertyId);
            const nights = getNights(booking.checkInDate, booking.checkOutDate);
            const isCheckIn =
              new Date(booking.checkInDate).toDateString() === selectedDate.toDateString();
            const isCheckOut =
              new Date(booking.checkOutDate).toDateString() === selectedDate.toDateString();

            return (
              <button
                key={booking.id}
                onClick={() => onSelectBooking(booking)}
                className="w-full text-left px-4 py-3.5 hover:bg-zinc-50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-1 self-stretch rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: color }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-zinc-800 truncate">
                        {booking.guestName}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0"
                        style={{ backgroundColor: `${color}15`, color: color }}
                      >
                        {booking.propertyName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mb-1.5">
                      <span>{formatShortDate(booking.checkInDate)}</span>
                      <ArrowRight className="w-3 h-3 text-zinc-300" />
                      <span>{formatShortDate(booking.checkOutDate)}</span>
                      <span className="text-zinc-300">·</span>
                      <span className="font-semibold text-zinc-600">{nights} noche{nights !== 1 ? "s" : ""}</span>
                      <span className="text-zinc-300">·</span>
                      <span>
                        <Users className="w-3 h-3 inline mr-0.5" />
                        {booking.guestsTotal}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-0.5 text-xs font-bold text-zinc-800">
                          <Euro className="w-3 h-3 text-zinc-500" />
                          {booking.totalPrice}
                        </span>
                        {booking.fullyPaid ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-150">
                            Total Pagado
                          </span>
                        ) : booking.depositPaid ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-150">
                            Señal Pagada
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-150">
                            Pendiente Pago
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isCheckIn && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-150">
                            ↓ Check-in
                          </span>
                        )}
                        {isCheckOut && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                            ↑ Check-out
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-zinc-300 group-hover:text-zinc-500 transition-colors text-xs flex-shrink-0 self-center">
                    →
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
