import { Calendar, Euro, DollarSign, Users, CheckCircle2, Clock, XCircle, FileText, AlertTriangle } from "lucide-react";
import { Property, Booking } from "../_hooks/use-booking-form";
import { Tramo } from "@/lib/price-calculator";

interface BookingDetailsViewProps {
  state: {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    adults: string;
    children: string;
    guestsTotal: string;
    totalPrice: string;
    depositAmount: string;
    depositPaid: boolean;
    depositPaidAt: string;
    fullyPaid: boolean;
    fullyPaidAt: string;
    tramos: Tramo[];
    notes: string;
    isEditMode: boolean;
  };
  computedValues: {
    selectedProperty?: Property;
    isOverCapacity: boolean | undefined;
    pendingAmount: number;
  };
  actions: {
    setStep: (step: "form" | "confirm-delete") => void;
    setIsReadOnly: (readOnly: boolean) => void;
  };
  onClose: () => void;
}

export default function BookingDetailsView({
  state,
  computedValues,
  actions,
  onClose,
}: BookingDetailsViewProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1 text-zinc-700 scrollbar-thin">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              Reserva para
            </span>
            <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">{state.guestName}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: computedValues.selectedProperty?.color || "#fff" }}
              />
              <span className="text-xs font-semibold text-zinc-700">
                {computedValues.selectedProperty?.name || "Vivienda"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end justify-center">
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-widest">
              Capacidad Vivienda
            </span>
            <span className="text-xs text-zinc-650 font-medium mt-1">
              Max. {computedValues.selectedProperty?.maxGuests || 0} huéspedes
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Fechas de la Estancia
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Entrada</span>
                <p className="text-sm font-semibold text-zinc-800">
                  {state.checkInDate ? new Date(state.checkInDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </p>
                <p className="text-xs text-zinc-550 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" /> {state.checkInTime || "16:00"}
                </p>
              </div>
              <span className="text-zinc-350 font-light text-lg">➔</span>
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Salida</span>
                <p className="text-sm font-semibold text-zinc-800">
                  {state.checkOutDate ? new Date(state.checkOutDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </p>
                <p className="text-xs text-zinc-550 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" /> {state.checkOutTime || "12:00"}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500">
              <span>Noches totales</span>
              <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-150 font-bold text-[11px]">
                {state.tramos.reduce((acc, t) => acc + t.nights, 0)} {state.tramos.reduce((acc, t) => acc + t.nights, 0) === 1 ? "noche" : "noches"}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Huéspedes
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-white border border-zinc-150 text-center shadow-2xs">
                <span className="text-[9px] font-semibold text-zinc-450 uppercase tracking-wider block">Adultos</span>
                <span className="text-base font-bold text-zinc-800 block mt-1">{state.adults}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-zinc-150 text-center shadow-2xs">
                <span className="text-[9px] font-semibold text-zinc-450 uppercase tracking-wider block">Niños</span>
                <span className="text-base font-bold text-zinc-800 block mt-1">{state.children}</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-zinc-150 text-center shadow-2xs">
                <span className="text-[9px] font-semibold text-zinc-450 uppercase tracking-wider block">Total</span>
                <span className="text-base font-bold text-indigo-700 block mt-1">{state.guestsTotal}</span>
              </div>
            </div>
            {computedValues.isOverCapacity && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Supera la capacidad máxima ({computedValues.selectedProperty?.maxGuests}).</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-5">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 pb-2">
            <DollarSign className="w-4 h-4 text-indigo-500" /> Estado Económico y Pagos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-zinc-200 flex flex-col justify-between shadow-2xs">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Precio Total</span>
              <span className="text-xl font-extrabold text-zinc-850 mt-1.5">{parseFloat(state.totalPrice || "0").toFixed(2)}€</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-zinc-200 flex flex-col justify-between shadow-2xs">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Importe de la Señal</span>
              <span className="text-xl font-extrabold text-zinc-850 mt-1.5">{parseFloat(state.depositAmount || "0").toFixed(2)}€</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-zinc-200 flex flex-col justify-between shadow-2xs">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Importe Pendiente</span>
              <span className="text-xl font-extrabold text-indigo-650 mt-1.5">{computedValues.pendingAmount.toFixed(2)}€</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-white border border-zinc-150 flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Señal</span>
                {state.depositPaid ? (
                  <p className="text-[10px] text-zinc-500">
                    Pagada el {state.depositPaidAt ? new Date(state.depositPaidAt + "T12:00:00").toLocaleDateString() : "-"}
                  </p>
                ) : (
                  <p className="text-[10px] text-zinc-400">Pendiente de pago</p>
                )}
              </div>
              {state.depositPaid ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250">
                  <CheckCircle2 className="w-3 h-3" /> PAGADA
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-250">
                  <XCircle className="w-3 h-3" /> PENDIENTE
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-white border border-zinc-150 flex items-center justify-between shadow-2xs">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Importe Total</span>
                {state.fullyPaid ? (
                  <p className="text-[10px] text-zinc-500">
                    Pagado el {state.fullyPaidAt ? new Date(state.fullyPaidAt + "T12:00:00").toLocaleDateString() : "-"}
                  </p>
                ) : (
                  <p className="text-[10px] text-zinc-400">Pendiente de liquidación</p>
                )}
              </div>
              {state.fullyPaid ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-250">
                  <CheckCircle2 className="w-3 h-3" /> PAGADO
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-250">
                  <XCircle className="w-3 h-3" /> PENDIENTE
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 pb-2">
            <Euro className="w-4 h-4 text-indigo-500" /> Desglose Estimado de Temporadas
          </h4>
          {state.tramos.length > 0 ? (
            <div className="space-y-2">
              {state.tramos.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-zinc-150 flex items-center justify-between text-xs gap-3 shadow-2xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-700">
                      Tramo {idx + 1}: {new Date(t.startDate).toLocaleDateString()} al {new Date(t.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-zinc-450">{t.nights} {t.nights === 1 ? "noche" : "noches"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.availableSeasons.length > 0 ? (
                      <>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-zinc-800"
                          style={{ backgroundColor: `${t.availableSeasons[0].color}18`, border: `1px solid ${t.availableSeasons[0].color}50`, color: t.availableSeasons[0].color }}
                        >
                          {t.availableSeasons[0].name}
                        </span>
                        <span className="font-medium text-zinc-500">{t.availableSeasons[0].pricePerNight}€/noche</span>
                        <span className="font-bold text-indigo-650">({(t.nights * t.availableSeasons[0].pricePerNight).toFixed(2)}€)</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-250">Sin temporada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">No hay información de tramos de temporada disponible.</p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 pb-2">
            <FileText className="w-4 h-4 text-indigo-500" /> Observaciones de la Reserva
          </h4>
          <p className="text-xs text-zinc-650 leading-relaxed whitespace-pre-wrap">
            {state.notes.trim() ? state.notes : <span className="text-zinc-400 italic">Sin observaciones o comentarios adicionales.</span>}
          </p>
        </div>

      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 flex-shrink-0 bg-zinc-50/50">
        <div>
          {state.isEditMode && (
            <button
              type="button"
              onClick={() => actions.setStep("confirm-delete")}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-750 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Eliminar Reserva
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => actions.setIsReadOnly(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
