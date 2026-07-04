"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import DatePicker from "@/components/date-picker";

interface Period {
  id?: string;
  startDate: string;
  endDate: string;
  description?: string;
}

interface PeriodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPeriod: { startDate: string; endDate: string; description: string }) => void;
  period: Period | null;
  isSaving: boolean;
}

export default function PeriodFormModal({
  isOpen,
  onClose,
  onSubmit,
  period,
  isSaving,
}: PeriodFormModalProps) {
  const [periodDesc, setPeriodDesc] = useState("");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPeriodDesc(period?.description || "");
      setPeriodStart(period?.startDate || "");
      setPeriodEnd(period?.endDate || "");
      setFormError(null);
    }
  }, [isOpen, period]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!periodStart || !periodEnd) {
      setFormError("Las fechas de inicio y fin son obligatorias.");
      return;
    }

    if (new Date(periodEnd) < new Date(periodStart)) {
      setFormError("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }

    onSubmit({
      startDate: periodStart,
      endDate: periodEnd,
      description: periodDesc.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-md font-bold text-zinc-900 mb-4">
          {period ? "Editar Periodo" : "Añadir Periodo"}
        </h3>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Descripción / Nombre
            </label>
            <input
              type="text"
              value={periodDesc}
              onChange={(e) => setPeriodDesc(e.target.value)}
              placeholder="Ej. Temporada Verano, Fines de semana"
              className="w-full px-3.5 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Fecha de Inicio
              </label>
              <DatePicker
                value={periodStart}
                onChange={setPeriodStart}
                triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Fecha de Fin
              </label>
              <DatePicker
                value={periodEnd}
                onChange={setPeriodEnd}
                min={periodStart}
                triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-3 border-t border-zinc-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
