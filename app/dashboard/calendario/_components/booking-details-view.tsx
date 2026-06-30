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
      <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1 text-slate-300 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-950/40 border border-slate-850">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
              Reserva para
            </span>
            <h3 className="text-xl font-extrabold text-white tracking-tight">{state.guestName}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: computedValues.selectedProperty?.color || "#fff" }}
              />
              <span className="text-xs font-semibold text-slate-300">
                {computedValues.selectedProperty?.name || "Vivienda"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end justify-center">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest">
              Capacidad Vivienda
            </span>
            <span className="text-xs text-slate-300 font-medium mt-1">
              Max. {computedValues.selectedProperty?.maxGuests || 0} huéspedes
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Fechas de la Estancia
            </h4>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Entrada</span>
                <p className="text-sm font-semibold text-white">
                  {state.checkInDate ? new Date(state.checkInDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> {state.checkInTime || "16:00"}
                </p>
              </div>
              <span className="text-slate-600 font-light text-lg">➔</span>
              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Salida</span>
                <p className="text-sm font-semibold text-white">
                  {state.checkOutDate ? new Date(state.checkOutDate + "T12:00:00").toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "-"}
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" /> {state.checkOutTime || "12:00"}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-xs text-slate-350">
              <span>Noches totales</span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/50 text-indigo-400 border border-indigo-900/40 font-bold text-[11px]">
                {state.tramos.reduce((acc, t) => acc + t.nights, 0)} {state.tramos.reduce((acc, t) => acc + t.nights, 0) === 1 ? "noche" : "noches"}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Huéspedes
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-900/30 text-center">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Adultos</span>
                <span className="text-base font-bold text-white block mt-1">{state.adults}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/30 text-center">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Niños</span>
                <span className="text-base font-bold text-white block mt-1">{state.children}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/30 text-center">
                <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">Total</span>
                <span className="text-base font-bold text-indigo-400 block mt-1">{state.guestsTotal}</span>
              </div>
            </div>
            {computedValues.isOverCapacity && (
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-450 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Supera la capacidad máxima ({computedValues.selectedProperty?.maxGuests}).</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-5">
          <h4 className="text-xs font-bold text-slate-455 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900/60 pb-2">
            <DollarSign className="w-4 h-4 text-indigo-500" /> Estado Económico y Pagos
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Precio Total</span>
              <span className="text-xl font-extrabold text-white mt-1.5">{parseFloat(state.totalPrice || "0").toFixed(2)}€</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Importe de la Señal</span>
              <span className="text-xl font-extrabold text-white mt-1.5">{parseFloat(state.depositAmount || "0").toFixed(2)}€</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-850 flex flex-col justify-between">
              <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wider">Importe Pendiente</span>
              <span className="text-xl font-extrabold text-indigo-400 mt-1.5">{computedValues.pendingAmount.toFixed(2)}€</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-855/60 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Señal</span>
                {state.depositPaid ? (
                  <p className="text-[10px] text-slate-450">
                    Pagada el {state.depositPaidAt ? new Date(state.depositPaidAt + "T12:00:00").toLocaleDateString() : "-"}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500">Pendiente de pago</p>
                )}
              </div>
              {state.depositPaid ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40">
                  <CheckCircle2 className="w-3 h-3" /> PAGADA
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 bg-amber-950/20 border border-amber-900/30">
                  <XCircle className="w-3 h-3" /> PENDIENTE
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-855/60 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Importe Total</span>
                {state.fullyPaid ? (
                  <p className="text-[10px] text-slate-455">
                    Pagado el {state.fullyPaidAt ? new Date(state.fullyPaidAt + "T12:00:00").toLocaleDateString() : "-"}
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500">Pendiente de liquidación</p>
                )}
              </div>
              {state.fullyPaid ? (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40">
                  <CheckCircle2 className="w-3 h-3" /> PAGADO
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 bg-amber-950/20 border border-amber-900/30">
                  <XCircle className="w-3 h-3" /> PENDIENTE
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-4">
          <h4 className="text-xs font-bold text-slate-455 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900/60 pb-2">
            <Euro className="w-4 h-4 text-indigo-500" /> Desglose Estimado de Temporadas
          </h4>
          {state.tramos.length > 0 ? (
            <div className="space-y-2">
              {state.tramos.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/20 border border-slate-855/60 flex items-center justify-between text-xs gap-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-350">
                      Tramo {idx + 1}: {new Date(t.startDate).toLocaleDateString()} al {new Date(t.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-slate-500">{t.nights} {t.nights === 1 ? "noche" : "noches"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {t.availableSeasons.length > 0 ? (
                      <>
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white/95"
                          style={{ backgroundColor: `${t.availableSeasons[0].color}33`, border: `1px solid ${t.availableSeasons[0].color}50` }}
                        >
                          {t.availableSeasons[0].name}
                        </span>
                        <span className="font-medium text-slate-400">{t.availableSeasons[0].pricePerNight}€/noche</span>
                        <span className="font-bold text-indigo-400">({(t.nights * t.availableSeasons[0].pricePerNight).toFixed(2)}€)</span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-900/30">Sin temporada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No hay información de tramos de temporada disponible.</p>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-3">
          <h4 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-2 border-b border-slate-900/60 pb-2">
            <FileText className="w-4 h-4 text-indigo-500" /> Observaciones de la Reserva
          </h4>
          <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
            {state.notes.trim() ? state.notes : <span className="text-slate-500 italic">Sin observaciones o comentarios adicionales.</span>}
          </p>
        </div>

      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 flex-shrink-0">
        <div>
          {state.isEditMode && (
            <button
              type="button"
              onClick={() => actions.setStep("confirm-delete")}
              className="px-4 py-2 bg-red-950/40 hover:bg-red-900 border border-red-900/30 text-red-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Eliminar Reserva
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={() => actions.setIsReadOnly(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Editar
          </button>
        </div>
      </div>
    </div>
  );
}
