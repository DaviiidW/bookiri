"use client";

import { useMemo } from "react";
import { CalendarProperty, CalendarBooking, formatShortDate, getNights, toMidnightMs } from "../../_types";
import { Calendar, User, ArrowRight, Home } from "lucide-react";

interface ListViewProps {
  currentDate: Date;
  properties: CalendarProperty[];
  onSelectBooking?: (booking: CalendarBooking) => void;
}

interface GroupedMonth {
  label: string;
  bookings: (CalendarBooking & { nights: number })[];
}

export default function ListView({ currentDate, properties, onSelectBooking }: ListViewProps) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const groupedMonths = useMemo<GroupedMonth[]>(() => {
    const allBookings = properties.flatMap((p) => p.bookings);

    const active = allBookings.filter((b) => {
      return toMidnightMs(new Date(b.checkOutDate)) >= toMidnightMs(today);
    });

    active.sort(
      (a, b) =>
        toMidnightMs(new Date(a.checkInDate)) -
        toMidnightMs(new Date(b.checkInDate))
    );

    const groups: Record<string, GroupedMonth> = {};
    for (const booking of active) {
      const d = new Date(booking.checkInDate);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
      if (!groups[key]) {
        groups[key] = { label, bookings: [] };
      }
      groups[key].bookings.push({
        ...booking,
        nights: getNights(booking.checkInDate, booking.checkOutDate),
      });
    }

    return Object.values(groups);
  }, [properties, today]);

  if (groupedMonths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3">
        <Calendar className="w-10 h-10 text-slate-600" />
        <p className="text-sm">No hay reservas actuales o futuras</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedMonths.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 capitalize">
              {group.label}
            </h3>
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-500">{group.bookings.length} reservas</span>
          </div>

          <div className="hidden sm:block rounded-2xl border border-slate-800/60 overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-slate-950/60">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="px-4 py-3 text-left">Vivienda</th>
                  <th className="px-4 py-3 text-left">Huésped</th>
                  <th className="px-4 py-3 text-left">Entrada</th>
                  <th className="px-4 py-3 text-left">Salida</th>
                  <th className="px-4 py-3 text-center">Noches</th>
                  <th className="px-4 py-3 text-center">Huéspedes</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                  <th className="px-4 py-3 text-center">Pago</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {group.bookings.map((booking) => {
                  const checkInMs = toMidnightMs(new Date(booking.checkInDate));
                  const checkOutMs = toMidnightMs(new Date(booking.checkOutDate));
                  const todayMs = toMidnightMs(today);
                  const isActive = checkInMs <= todayMs && checkOutMs > todayMs;

                  return (
                    <tr
                      key={booking.id}
                      className={`hover:bg-slate-900/30 transition-colors cursor-pointer ${isActive ? "bg-indigo-950/10" : ""}`}
                      onClick={() => onSelectBooking?.(booking)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: booking.propertyColor }}
                          />
                          <span className="font-medium text-slate-300 truncate max-w-[120px]">
                            {booking.propertyName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-200">{booking.guestName}</td>
                      <td className="px-4 py-3 text-slate-400">{formatShortDate(booking.checkInDate)}</td>
                      <td className="px-4 py-3 text-slate-400">{formatShortDate(booking.checkOutDate)}</td>
                      <td className="px-4 py-3 text-center text-slate-300 font-semibold">{booking.nights}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{booking.guestsTotal}</td>
                      <td className="px-4 py-3 text-right text-slate-200 font-semibold">{booking.totalPrice}€</td>
                      <td className="px-4 py-3 text-center">
                        {booking.fullyPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/30 border border-emerald-800/30 text-emerald-400">
                            Pagado
                          </span>
                        ) : booking.depositPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950/30 border border-blue-800/30 text-blue-400">
                            Señal Pagada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/30 border border-amber-800/30 text-amber-400">
                            Pendiente
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="sm:hidden space-y-2">
            {group.bookings.map((booking) => {
              const checkInMs = toMidnightMs(new Date(booking.checkInDate));
              const checkOutMs = toMidnightMs(new Date(booking.checkOutDate));
              const todayMs = toMidnightMs(today);
              const isActive = checkInMs <= todayMs && checkOutMs > todayMs;

              return (
                <div
                  key={booking.id}
                  onClick={() => onSelectBooking?.(booking)}
                  className={`p-3 rounded-xl border space-y-2 cursor-pointer transition-colors hover:border-indigo-500/50 ${
                    isActive
                      ? "bg-indigo-950/10 border-indigo-900/40"
                      : "bg-slate-900/20 border-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: booking.propertyColor }}
                      />
                      <span className="text-xs font-semibold text-slate-200">
                        {booking.propertyName}
                      </span>
                    </div>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-950/50 text-indigo-400 border border-indigo-900/50">
                        Activa
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    {booking.guestName}
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500">{booking.guestsTotal} huéspedes</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{formatShortDate(booking.checkInDate)}</span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span>{formatShortDate(booking.checkOutDate)}</span>
                    <span className="text-slate-600">·</span>
                    <span className="font-semibold text-slate-300">{booking.nights} noches</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
                    <span className="text-[10px] text-slate-450">
                      Monto: <strong className="text-slate-200 font-semibold">{booking.totalPrice}€</strong>
                    </span>
                    <div>
                      {booking.fullyPaid ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/30 border border-emerald-800/30 text-emerald-400">
                          Pagado
                        </span>
                      ) : booking.depositPaid ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950/30 border border-blue-800/30 text-blue-400">
                          Señal Pagada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/30 border border-amber-800/30 text-amber-400">
                          Pendiente
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
