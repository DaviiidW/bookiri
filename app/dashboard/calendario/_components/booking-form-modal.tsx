"use client";

import { X, Loader2, Calendar, AlertTriangle } from "lucide-react";
import { useBookingForm, Booking } from "../_hooks/use-booking-form";
import BookingDetailsView from "./booking-details-view";
import BookingEditForm from "./booking-edit-form";

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking?: Booking | null;
  defaultCheckInDate?: string;
  defaultCheckOutDate?: string;
  defaultPropertyId?: string;
}

export default function BookingFormModal({
  isOpen,
  onClose,
  onSuccess,
  booking,
  defaultCheckInDate = "",
  defaultCheckOutDate = "",
  defaultPropertyId = "",
}: BookingFormModalProps) {
  const { state, actions, computedValues, refs } = useBookingForm({
    isOpen,
    booking,
    defaultCheckInDate,
    defaultCheckOutDate,
    defaultPropertyId,
    onSuccess,
    onClose,
  });

  if (!isOpen) return null;

  const modalTitle = state.isReadOnly ? "Detalles de la Reserva" : (state.isEditMode ? "Editar Reserva" : "Nueva Reserva");

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800 flex-shrink-0">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" />
            {modalTitle}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {state.isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-450">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs">Cargando datos del formulario...</p>
          </div>
        ) : (
          <>
            {state.step === "form" && (
              state.isReadOnly ? (
                <BookingDetailsView
                  state={state}
                  computedValues={computedValues}
                  actions={actions}
                  onClose={onClose}
                />
              ) : (
                <BookingEditForm
                  state={state}
                  computedValues={computedValues}
                  actions={actions}
                  refs={refs}
                  onClose={onClose}
                />
              )
            )}

            {state.step === "confirm-delete" && (
              <div className="flex flex-col flex-1 p-6 space-y-4 text-slate-300">
                <div className="p-3 rounded-2xl bg-red-950/20 border border-red-900/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Confirmar eliminación</h3>
                    <p className="text-xs text-slate-300 mt-1">
                      ¿Estás seguro de que deseas eliminar esta reserva de forma permanente? Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => actions.setStep("form")}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={actions.confirmDelete}
                    disabled={state.isSaving}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2"
                  >
                    {state.isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirmar Eliminación
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
