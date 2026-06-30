import React from "react";
import { AlertTriangle, Users, User, Calendar, Euro, DollarSign, Clock, FileText, Loader2 } from "lucide-react";
import { Property } from "../_hooks/use-booking-form";
import { Tramo } from "@/lib/price-calculator";

interface BookingEditFormProps {
  state: {
    propertyId: string;
    guestName: string;
    guestsTotal: string;
    adults: string;
    children: string;
    checkInDate: string;
    checkOutDate: string;
    checkInTime: string;
    checkOutTime: string;
    notes: string;
    priceCalculationMode: "AUTOMATIC" | "MANUAL";
    totalPrice: string;
    depositAmount: string;
    depositPaid: boolean;
    depositPaidAt: string;
    fullyPaid: boolean;
    fullyPaidAt: string;
    tramos: Tramo[];
    isLoadingData: boolean;
    isSaving: boolean;
    error: string | null;
    isReadOnly: boolean;
    manualPriceBackup: string;
    step: "form" | "confirm-delete";
    properties: Property[];
    seasons: any[];
    isEditMode: boolean;
  };
  computedValues: {
    selectedProperty?: Property;
    guestsNum: number;
    isOverCapacity: boolean | undefined;
    pendingAmount: number;
  };
  actions: {
    setPropertyId: (v: string) => void;
    setGuestName: (v: string) => void;
    setGuestsTotal: (v: string) => void;
    setAdults: (v: string) => void;
    setChildren: (v: string) => void;
    setCheckInDate: (v: string) => void;
    setCheckOutDate: (v: string) => void;
    setCheckInTime: (v: string) => void;
    setCheckOutTime: (v: string) => void;
    setNotes: (v: string) => void;
    setPriceCalculationMode: (v: "AUTOMATIC" | "MANUAL") => void;
    setTotalPrice: (v: string) => void;
    setDepositAmount: (v: string) => void;
    setDepositPaid: (v: boolean) => void;
    setDepositPaidAt: (v: string) => void;
    setFullyPaid: (v: boolean) => void;
    setFullyPaidAt: (v: string) => void;
    setIsReadOnly: (v: boolean) => void;
    setStep: (v: "form" | "confirm-delete") => void;
    handleModeToggle: (v: "AUTOMATIC" | "MANUAL") => void;
    handleSubmit: (e: React.FormEvent) => void;
  };
  refs: {
    checkInRef: React.RefObject<HTMLInputElement | null>;
    checkOutRef: React.RefObject<HTMLInputElement | null>;
    depDateRef: React.RefObject<HTMLInputElement | null>;
    fullDateRef: React.RefObject<HTMLInputElement | null>;
  };
  onClose: () => void;
}

export default function BookingEditForm({
  state,
  computedValues,
  actions,
  refs,
  onClose,
}: BookingEditFormProps) {
  return (
    <form onSubmit={actions.handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1 text-slate-300">
        {state.error && (
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" /> Datos de la Reserva y Huésped
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Vivienda
              </label>
              <select
                value={state.propertyId}
                onChange={(e) => actions.setPropertyId(e.target.value)}
                disabled={state.isReadOnly}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                required
              >
                <option value="">Selecciona una vivienda...</option>
                {state.properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Nombre del Huésped
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={state.guestName}
                  onChange={(e) => actions.setGuestName(e.target.value)}
                  placeholder="Nombre completo"
                  disabled={state.isReadOnly}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                  required
                />
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Adultos
              </label>
              <input
                type="number"
                min="0"
                value={state.adults}
                disabled={state.isReadOnly}
                onChange={(e) => {
                  actions.setAdults(e.target.value);
                  const total = (parseInt(e.target.value, 10) || 0) + (parseInt(state.children, 10) || 0);
                  actions.setGuestsTotal(String(total));
                }}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Niños
              </label>
              <input
                type="number"
                min="0"
                value={state.children}
                disabled={state.isReadOnly}
                onChange={(e) => {
                  actions.setChildren(e.target.value);
                  const total = (parseInt(state.adults, 10) || 0) + (parseInt(e.target.value, 10) || 0);
                  actions.setGuestsTotal(String(total));
                }}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Huéspedes
              </label>
              <input
                type="number"
                min="1"
                value={state.guestsTotal}
                disabled={state.isReadOnly}
                onChange={(e) => actions.setGuestsTotal(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                required
              />
            </div>
          </div>

          {computedValues.isOverCapacity && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/30 text-amber-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Advertencia de capacidad:</strong> El número de huéspedes ({computedValues.guestsNum}) supera el límite máximo permitido por la vivienda ({computedValues.selectedProperty?.maxGuests}).
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Fechas y Horarios
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Entrada
              </label>
              <div className="relative">
                <input
                  type="date"
                  ref={refs.checkInRef}
                  value={state.checkInDate}
                  disabled={state.isReadOnly}
                  onChange={(e) => actions.setCheckInDate(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                  required
                />
                {!state.isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        refs.checkInRef.current?.showPicker();
                      } catch (e) {
                        refs.checkInRef.current?.focus();
                      }
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-200 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Salida
              </label>
              <div className="relative">
                <input
                  type="date"
                  ref={refs.checkOutRef}
                  value={state.checkOutDate}
                  disabled={state.isReadOnly}
                  onChange={(e) => actions.setCheckOutDate(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                  required
                  min={state.checkInDate}
                />
                {!state.isReadOnly && (
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        refs.checkOutRef.current?.showPicker();
                      } catch (e) {
                        refs.checkOutRef.current?.focus();
                      }
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-455 hover:text-slate-200 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Hora Entrada
              </label>
              <input
                type="text"
                value={state.checkInTime}
                disabled={state.isReadOnly}
                onChange={(e) => actions.setCheckInTime(e.target.value)}
                placeholder="e.g. 16:00"
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Hora Salida
              </label>
              <input
                type="text"
                value={state.checkOutTime}
                disabled={state.isReadOnly}
                onChange={(e) => actions.setCheckOutTime(e.target.value)}
                placeholder="e.g. 12:00"
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5 text-indigo-500" /> Tarifas y Temporadas
            </h3>
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-850">
              <button
                type="button"
                disabled={state.isReadOnly}
                onClick={() => actions.handleModeToggle("AUTOMATIC")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                  state.priceCalculationMode === "AUTOMATIC"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                } disabled:opacity-50`}
              >
                Auto
              </button>
              <button
                type="button"
                disabled={state.isReadOnly}
                onClick={() => actions.handleModeToggle("MANUAL")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                  state.priceCalculationMode === "MANUAL"
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white"
                } disabled:opacity-50`}
              >
                Manual
              </button>
            </div>
          </div>

          {state.priceCalculationMode === "AUTOMATIC" ? (
            <div className="space-y-4">
              {state.tramos.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Introduce vivienda y fechas válidas para ver la segmentación.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-slate-450 uppercase tracking-wider font-bold">Desglose de tramos detectados:</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {state.tramos.map((t, idx) => {
                      return (
                        <div key={idx} className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-slate-200">
                              Tramo {idx + 1}: {new Date(t.startDate).toLocaleDateString()} al {new Date(t.endDate).toLocaleDateString()} ({t.nights} noche{t.nights > 1 ? "s" : ""})
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {t.availableSeasons.length === 0 ? (
                              <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-950/20 px-2 py-0.5 rounded-full border border-amber-900/30">
                                Sin temporada
                              </span>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span
                                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-white/95"
                                  style={{
                                    backgroundColor: `${t.availableSeasons[0].color}33`,
                                    border: `1px solid ${t.availableSeasons[0].color}80`
                                  }}
                                >
                                  {t.availableSeasons[0].name}
                                </span>
                                <span className="text-slate-400 font-medium">
                                  {t.availableSeasons[0].pricePerNight}€/noche
                                </span>
                                <span className="text-indigo-400 font-bold ml-1">
                                  ({(t.nights * t.availableSeasons[0].pricePerNight).toFixed(2)}€)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {state.tramos.some((t) => !t.selectedSeasonId) && (
                    <div className="p-3 rounded-xl bg-amber-950/10 border border-amber-900/20 text-amber-400 text-xs">
                      <p><strong>Atención:</strong> Hay tramos pendientes de temporada o no configurados. Se requiere cambiar a modo manual o asociar temporadas válidas para completar la reserva.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Precio Total (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={state.totalPrice}
                  disabled={state.isReadOnly}
                  onChange={(e) => {
                    actions.setTotalPrice(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-500" /> Registro de Pagos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Precio Total</span>
              <span className="text-lg font-extrabold text-white mt-1">{parseFloat(state.totalPrice || "0").toFixed(2)}€</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Importe de la Señal
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.depositAmount}
                disabled={state.isReadOnly}
                onChange={(e) => actions.setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider">Importe Pendiente</span>
              <span className="text-lg font-extrabold text-indigo-400 mt-1">{computedValues.pendingAmount.toFixed(2)}€</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Señal Pagada</span>
                <input
                  type="checkbox"
                  checked={state.depositPaid}
                  disabled={state.isReadOnly}
                  onChange={(e) => actions.setDepositPaid(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                />
              </div>
              {state.depositPaid && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Fecha de Pago de la Señal
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      ref={refs.depDateRef}
                      value={state.depositPaidAt}
                      disabled={state.isReadOnly}
                      onChange={(e) => actions.setDepositPaidAt(e.target.value)}
                      className="w-full pl-3 pr-9 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-205 focus:outline-none disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                      required
                    />
                    {!state.isReadOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            refs.depDateRef.current?.showPicker();
                          } catch (e) {
                            refs.depDateRef.current?.focus();
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <Calendar className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">Totalmente Pagado</span>
                <input
                  type="checkbox"
                  checked={state.fullyPaid}
                  disabled={state.isReadOnly}
                  onChange={(e) => actions.setFullyPaid(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                />
              </div>
              {state.fullyPaid && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Fecha de Pago Completo
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      ref={refs.fullDateRef}
                      value={state.fullyPaidAt}
                      disabled={state.isReadOnly}
                      onChange={(e) => actions.setFullyPaidAt(e.target.value)}
                      className="w-full pl-3 pr-9 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-205 focus:outline-none disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
                      required
                    />
                    {!state.isReadOnly && (
                      <button
                        type="button"
                        onClick={() => {
                          try {
                            refs.fullDateRef.current?.showPicker();
                          } catch (e) {
                            refs.fullDateRef.current?.focus();
                          }
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                      >
                        <Calendar className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Observaciones
          </h3>
          <textarea
            value={state.notes}
            onChange={(e) => actions.setNotes(e.target.value)}
            placeholder="Añade anotaciones relevantes para la reserva..."
            disabled={state.isReadOnly}
            rows={3}
            className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs text-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-950/20 disabled:border-slate-900/50 disabled:text-slate-400 disabled:cursor-default"
          />
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
            Cancelar
          </button>
          <button
            type="submit"
            disabled={state.isSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            {state.isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
