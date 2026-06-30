"use client";

import { Loader2, AlertCircle } from "lucide-react";
import { useCalendarData } from "../_hooks/use-calendar-data";
import CalendarToolbar from "./calendar-toolbar";
import MonthView from "./views/month-view";
import GanttView from "./views/gantt-view";
import ListView from "./views/list-view";

export default function CalendarShell() {
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
  } = useCalendarData();

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
              />
            )}

            {view === "gantt" && (
              <GanttView
                currentDate={currentDate}
                properties={filteredProperties}
              />
            )}
            {view === "list" && (
              <ListView
                currentDate={currentDate}
                properties={filteredProperties}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
