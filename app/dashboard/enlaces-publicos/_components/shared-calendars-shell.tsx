"use client";

import { useState, useEffect, useCallback } from "react";
import SharedCalendarCard from "./shared-calendar-card";
import SharedCalendarFormModal from "./shared-calendar-form-modal";

export interface SharedCalendarProperty {
  property: {
    id: string;
    name: string;
    color: string;
  };
}

export interface SharedCalendarPriceRule {
  id: string;
  label: string | null;
  startDate: string;
  endDate: string;
  pricePerNight: number;
  daysOfWeek: number[];
  propertyId: string;
}

export interface SharedCalendar {
  id: string;
  token: string;
  name: string | null;
  showPrice: boolean;
  showSeasonPrices: boolean;
  isActive: boolean;
  expiresAt: string | null;
  viewType: string;
  createdAt: string;
  properties: SharedCalendarProperty[];
  priceRules: SharedCalendarPriceRule[];
}

export default function SharedCalendarsShell() {
  const [calendars, setCalendars] = useState<SharedCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<SharedCalendar | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/shared-calendars");
      if (res.ok) {
        const data = await res.json();
        setCalendars(data.calendars);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleEdit = (calendar: SharedCalendar) => {
    setEditingCalendar(calendar);
    setShowModal(true);
  };

  const handleRevoke = async (id: string) => {
    await fetch(`/api/shared-calendars/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/shared-calendars/${id}`, { method: "DELETE" });
    load();
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingCalendar(null);
  };

  const handleModalSave = () => {
    handleModalClose();
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
            Calendarios Compartidos
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Genera enlaces públicos de solo lectura para compartir disponibilidad con clientes o colaboradores.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCalendar(null);
            setShowModal(true);
          }}
          className="self-start md:self-auto shrink-0 flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo enlace
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-2 border-zinc-200 border-t-violet-500 rounded-full animate-spin" />
        </div>
      ) : calendars.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white border border-zinc-200 rounded-2xl">
          <div className="w-14 h-14 mb-4 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <p className="text-zinc-700 font-semibold">Sin enlaces todavía</p>
          <p className="text-zinc-500 text-sm mt-1">Crea tu primer enlace compartido y compártelo con tus clientes.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {calendars.map((cal) => (
            <SharedCalendarCard
              key={cal.id}
              calendar={cal}
              onEdit={handleEdit}
              onRevoke={handleRevoke}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <SharedCalendarFormModal
          calendar={editingCalendar}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
