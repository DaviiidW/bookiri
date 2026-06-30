"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Plus } from "lucide-react";
import { useCalendarData } from "../_hooks/use-calendar-data";
import CalendarToolbar from "./calendar-toolbar";
import MonthView from "./views/month-view";
import GanttView from "./views/gantt-view";
import ListView from "./views/list-view";
import BookingFormModal from "./booking-form-modal";
import { CalendarBooking } from "../_types";

export default function CalendarShell() {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    allProperties,
    filteredProperties,
    isLoading,
    error,
    view,
    setView,
    currentDate,
    goToPrev,
    goToNext,
    goToToday,
    selectedPropertyId,
    setSelectedPropertyId,
    refresh,
  } = useCalendarData();

  const handleSelectBooking = async (b: CalendarBooking) => {
    try {
      const res = await fetch(`/api/bookings/${b.id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedBooking(data.booking);
        setIsModalOpen(true);
      } else {
        console.error(data.error || "Error al cargar la reserva");
      }
    } catch (err) {
      console.error("Error fetching booking:", err);
    }
  };

  return (
    <div className="space-y-5">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onPrev={goToPrev}
        onNext={goToNext}
        onToday={goToToday}
        properties={allProperties}
        selectedPropertyId={selectedPropertyId}
        onPropertyChange={setSelectedPropertyId}
      />

      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-4 md:p-6 shadow-xl min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm font-medium">Cargando calendario...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-red-400 gap-3">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {view === "month" && (
              <MonthView
                currentDate={currentDate}
                properties={filteredProperties}
                onSelectBooking={handleSelectBooking}
              />
            )}

            {view === "gantt" && (
              <GanttView
                currentDate={currentDate}
                properties={filteredProperties}
                onSelectBooking={handleSelectBooking}
              />
            )}
            {view === "list" && (
              <ListView
                currentDate={currentDate}
                properties={filteredProperties}
                onSelectBooking={handleSelectBooking}
              />
            )}
          </>
        )}
      </div>

      <button
        onClick={() => {
          setSelectedBooking(null);
          setIsModalOpen(true);
        }}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all z-40 cursor-pointer flex items-center justify-center border border-indigo-500/20"
        title="Nueva Reserva"
      >
        <Plus className="w-6 h-6" />
      </button>

      <BookingFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooking(null);
        }}
        onSuccess={refresh}
        booking={selectedBooking}
      />
    </div>
  );
}
