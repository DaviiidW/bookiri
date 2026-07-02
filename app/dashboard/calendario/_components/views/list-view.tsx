"use client";

import { useMemo } from "react";
import { CalendarProperty, CalendarBooking, formatShortDate, getNights, toMidnightMs } from "../../_types";
import { Calendar, User, ArrowRight } from "lucide-react";

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
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 gap-3">
        <Calendar className="w-10 h-10 text-zinc-400" />
        <p className="text-sm">No hay reservas actuales o futuras</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groupedMonths.map((group) => (
        <div key={group.label}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 capitalize">
              {group.label}
            </h3>
            <div className="flex-1 h-px bg-zinc-200" />
            <span className="text-[10px] text-zinc-400">{group.bookings.length} reservas</span>
          </div>

          <div className="hidden sm:block rounded-2xl border border-zinc-200 overflow-hidden bg-white shadow-sm">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold bg-zinc-100/70 border-b border-zinc-200">
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
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                {group.bookings.map((booking) => {
                  const checkInMs = toMidnightMs(new Date(booking.checkInDate));
                  const checkOutMs = toMidnightMs(new Date(booking.checkOutDate));
                  const todayMs = toMidnightMs(today);
                  const isActive = checkInMs <= todayMs && checkOutMs > todayMs;

                  return (
                    <tr
                      key={booking.id}
                      className={`cursor-pointer transition-colors ${
                        isActive ? "bg-indigo-50/60 hover:bg-indigo-50" : "odd:bg-white even:bg-zinc-50/60 hover:bg-zinc-100/80"
                      }`}
                      onClick={() => onSelectBooking?.(booking)}
                    >
                      <td className="px-4 py-3.5 border-r border-zinc-100">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: booking.propertyColor }}
                          />
                          <span className="font-medium text-zinc-800 truncate max-w-[120px]">
                            {booking.propertyName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-zinc-900 border-r border-zinc-100">{booking.guestName}</td>
                      <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap border-r border-zinc-100">{formatShortDate(booking.checkInDate)}</td>
                      <td className="px-4 py-3.5 text-zinc-500 whitespace-nowrap border-r border-zinc-100">{formatShortDate(booking.checkOutDate)}</td>
                      <td className="px-4 py-3.5 text-center text-zinc-700 font-semibold tabular-nums border-r border-zinc-100">{booking.nights}</td>
                      <td className="px-4 py-3.5 text-center text-zinc-500 tabular-nums border-r border-zinc-100">{booking.guestsTotal}</td>
                      <td className="px-4 py-3.5 text-right text-zinc-900 font-bold tabular-nums border-r border-zinc-100">{booking.totalPrice}€</td>
                      <td className="px-4 py-3.5 text-center">
                        {booking.fullyPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                            Pagado
                          </span>
                        ) : booking.depositPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 border border-blue-200 text-blue-700">
                            Señal Pagada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
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

          <div className="sm:hidden space-y-2.5">
            {group.bookings.map((booking) => {
              const checkInMs = toMidnightMs(new Date(booking.checkInDate));
              const checkOutMs = toMidnightMs(new Date(booking.checkOutDate));
              const todayMs = toMidnightMs(today);
              const isActive = checkInMs <= todayMs && checkOutMs > todayMs;

              return (
                <div
                  key={booking.id}
                  onClick={() => onSelectBooking?.(booking)}
                  className={`p-3 rounded-xl border space-y-2 cursor-pointer transition-all hover:border-indigo-400 hover:shadow-sm ${
                    isActive
                      ? "bg-indigo-50/60 border-indigo-200"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: booking.propertyColor }}
                      />
                      <span className="text-xs font-semibold text-zinc-800">
                        {booking.propertyName}
                      </span>
                    </div>
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Activa
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    {booking.guestName}
                    <span className="text-zinc-300">·</span>
                    <span className="text-zinc-500">{booking.guestsTotal} huéspedes</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span>{formatShortDate(booking.checkInDate)}</span>
                    <ArrowRight className="w-3 h-3 text-zinc-300" />
                    <span>{formatShortDate(booking.checkOutDate)}</span>
                    <span className="text-zinc-300">·</span>
                    <span className="font-semibold text-zinc-700">{booking.nights} noches</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                    <span className="text-[10px] text-zinc-500">
                      Monto: <strong className="text-zinc-900 font-bold">{booking.totalPrice}€</strong>
                    </span>
                    <div>
                      {booking.fullyPaid ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700">
                          Pagado
                        </span>
                      ) : booking.depositPaid ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 border border-blue-200 text-blue-700">
                          Señal Pagada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-700">
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
