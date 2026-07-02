import React from "react";
import { AlertTriangle, Users, User, Calendar, Euro, DollarSign, Clock, FileText, Loader2 } from "lucide-react";
import { Property } from "../_hooks/use-booking-form";
import { Tramo } from "@/lib/price-calculator";
import DatePicker from "@/components/date-picker";

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
  onClose: () => void;
}

export default function BookingEditForm({
  state,
  computedValues,
  actions,
  onClose,
}: BookingEditFormProps) {
  return (
    <form onSubmit={actions.handleSubmit} className="flex flex-col flex-1 overflow-hidden">
      <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1 text-zinc-750 bg-white">
        {state.error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs font-medium flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" /> Datos de la Reserva y Huésped
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Vivienda
              </label>
              <select
                value={state.propertyId}
                onChange={(e) => actions.setPropertyId(e.target.value)}
                disabled={state.isReadOnly}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
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
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Nombre del Huésped
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={state.guestName}
                  onChange={(e) => actions.setGuestName(e.target.value)}
                  placeholder="Nombre completo"
                  disabled={state.isReadOnly}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
                  required
                />
                <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
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
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
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
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Total Huéspedes
              </label>
              <input
                type="number"
                min="1"
                value={state.guestsTotal}
                disabled={state.isReadOnly}
                onChange={(e) => actions.setGuestsTotal(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-850 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
                required
              />
            </div>
          </div>

          {computedValues.isOverCapacity && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>
                <strong>Advertencia de capacidad:</strong> El número de huéspedes ({computedValues.guestsNum}) supera el límite máximo permitido por la vivienda ({computedValues.selectedProperty?.maxGuests}).
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Fechas y Horarios
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Entrada
              </label>
              <DatePicker
                value={state.checkInDate}
                onChange={actions.setCheckInDate}
                disabled={state.isReadOnly}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Salida
              </label>
              <DatePicker
                value={state.checkOutDate}
                onChange={actions.setCheckOutDate}
                disabled={state.isReadOnly}
                min={state.checkInDate}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Hora Entrada
              </label>
              <input
                type="text"
                value={state.checkInTime}
                disabled={state.isReadOnly}
                onChange={(e) => actions.setCheckInTime(e.target.value)}
                placeholder="e.g. 16:00"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                Hora Salida
              </label>
              <input
                type="text"
                value={state.checkOutTime}
                disabled={state.isReadOnly}
                onChange={(e) => actions.setCheckOutTime(e.target.value)}
                placeholder="e.g. 12:00"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <Euro className="w-3.5 h-3.5 text-indigo-500" /> Tarifas y Temporadas
            </h3>
            <div className="flex items-center bg-zinc-150 rounded-lg p-0.5 border border-zinc-200">
              <button
                type="button"
                disabled={state.isReadOnly}
                onClick={() => actions.handleModeToggle("AUTOMATIC")}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                  state.priceCalculationMode === "AUTOMATIC"
                    ? "bg-indigo-650 text-white"
                    : "text-zinc-550 hover:text-zinc-900"
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
                    ? "bg-indigo-650 text-white"
                    : "text-zinc-550 hover:text-zinc-900"
                } disabled:opacity-50`}
              >
                Manual
              </button>
            </div>
          </div>

          {state.priceCalculationMode === "AUTOMATIC" ? (
            <div className="space-y-4">
              {state.tramos.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">Introduce vivienda y fechas válidas para ver la segmentación.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[10px] text-zinc-450 uppercase tracking-wider font-bold">Desglose de tramos detectados:</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                    {state.tramos.map((t, idx) => {
                      return (
                        <div key={idx} className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          <div>
                            <p className="font-semibold text-zinc-750">
                              Tramo {idx + 1}: {new Date(t.startDate).toLocaleDateString()} al {new Date(t.endDate).toLocaleDateString()} ({t.nights} noche{t.nights > 1 ? "s" : ""})
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {t.availableSeasons.length === 0 ? (
                              <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded-full border border-amber-250">
                                Sin temporada
                              </span>
                            ) : (
                              <div className="flex items-center gap-3">
                                <span
                                  className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-zinc-800"
                                  style={{
                                    backgroundColor: `${t.availableSeasons[0].color}18`,
                                    border: `1px solid ${t.availableSeasons[0].color}50`,
                                    color: t.availableSeasons[0].color,
                                  }}
                                >
                                  {t.availableSeasons[0].name}
                                </span>
                                <span className="text-zinc-500 font-medium">
                                  {t.availableSeasons[0].pricePerNight}€/noche
                                </span>
                                <span className="text-indigo-650 font-bold ml-1">
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
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                      <p><strong>Atención:</strong> Hay tramos de estancia sin temporada configurada. Cambia a modo manual o asocia temporadas válidas.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
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
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
                  required
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-indigo-500" /> Registro de Pagos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Precio Total</span>
              <span className="text-lg font-extrabold text-zinc-850 mt-1">{parseFloat(state.totalPrice || "0").toFixed(2)}€</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Importe de la Señal
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={state.depositAmount}
                disabled={state.isReadOnly}
                onChange={(e) => actions.setDepositAmount(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
                required
              />
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Importe Pendiente</span>
              <span className="text-lg font-extrabold text-indigo-650 mt-1">{computedValues.pendingAmount.toFixed(2)}€</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800">Señal Pagada</span>
                <input
                  type="checkbox"
                  checked={state.depositPaid}
                  disabled={state.isReadOnly || state.fullyPaid}
                  onChange={(e) => actions.setDepositPaid(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 bg-white text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                />
              </div>
              {state.depositPaid && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Fecha de Pago de la Señal
                  </label>
                  <DatePicker
                    value={state.depositPaidAt}
                    onChange={actions.setDepositPaidAt}
                    disabled={state.isReadOnly}
                    triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800">Totalmente Pagado</span>
                <input
                  type="checkbox"
                  checked={state.fullyPaid}
                  disabled={state.isReadOnly}
                  onChange={(e) => actions.setFullyPaid(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 bg-white text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-50"
                />
              </div>
              {state.fullyPaid && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                    Fecha de Pago Completo
                  </label>
                  <DatePicker
                    value={state.fullyPaidAt}
                    onChange={actions.setFullyPaidAt}
                    disabled={state.isReadOnly}
                    triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Observaciones
          </h3>
          <textarea
            value={state.notes}
            onChange={(e) => actions.setNotes(e.target.value)}
            placeholder="Añade anotaciones relevantes para la reserva..."
            disabled={state.isReadOnly}
            rows={3}
            className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 flex-shrink-0 bg-zinc-50/50">
        <div>
          {state.isEditMode && (
            <button
              type="button"
              onClick={() => actions.setStep("confirm-delete")}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-755 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Eliminar Reserva
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={state.isSaving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            {state.isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}
