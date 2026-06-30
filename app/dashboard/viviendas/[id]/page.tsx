"use client";

import { use } from "react";
import Link from "next/link";
import {
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import AvailabilityTimeline from "../_components/availability-timeline";
import ConflictResolutionModal from "../_components/conflict-resolution-modal";
import PropertyDetailHeader from "../_components/property-detail-header";
import PropertyBookingsList from "../_components/property-bookings-list";
import PeriodFormModal from "../_components/period-form-modal";
import { usePropertyDetail } from "./_hooks/use-property-detail";

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    property,
    periods,
    isLoading,
    isSaving,
    error,
    success,
    isPeriodFormOpen,
    editingPeriod,
    isConflictOpen,
    affectedBookings,
    bookings,
    bookingsPage,
    bookingsLimit,
    bookingsTotalCount,
    isBookingsLoading,
    // handlers
    setBookingsPage,
    setBookingsLimit,
    handleOpenAddPeriod,
    handleOpenEditPeriod,
    handleClosePeriodForm,
    handlePeriodFormSubmit,
    handleLocalDeletePeriod,
    handleCloseConflict,
    handleConfirmConflicts,
  } = usePropertyDetail(id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Cargando detalles de la vivienda...</p>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="p-6 rounded-2xl bg-red-950/20 border border-red-800/40 text-red-200 flex flex-col items-center gap-4 text-center max-w-md mx-auto mt-10">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <div>
          <h3 className="font-bold text-lg">Error al cargar</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Link
          href="/dashboard/viviendas"
          className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
        >
          Volver a Viviendas
        </Link>
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      <PropertyDetailHeader property={property} />

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-850 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Periodos de Disponibilidad</h3>
            <p className="text-xs text-slate-455 mt-1">Configura los rangos de fechas. Los cambios se guardarán automáticamente.</p>
          </div>
          <button
            onClick={handleOpenAddPeriod}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-855 text-indigo-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Periodo</span>
          </button>
        </div>

        {isSaving && (
          <div className="py-2 text-center text-xs text-indigo-400 flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Guardando cambios en la base de datos...</span>
          </div>
        )}

        <AvailabilityTimeline
          periods={periods}
          onEdit={handleOpenEditPeriod}
          onDelete={handleLocalDeletePeriod}
        />
      </div>

      <PropertyBookingsList
        bookings={bookings}
        isBookingsLoading={isBookingsLoading}
        bookingsLimit={bookingsLimit}
        bookingsPage={bookingsPage}
        bookingsTotalCount={bookingsTotalCount}
        onLimitChange={(limit) => {
          setBookingsLimit(limit);
          setBookingsPage(1);
        }}
        onPageChange={(page) => setBookingsPage(page)}
      />

      <PeriodFormModal
        isOpen={isPeriodFormOpen}
        onClose={handleClosePeriodForm}
        onSubmit={handlePeriodFormSubmit}
        period={editingPeriod}
        isSaving={isSaving}
      />

      <ConflictResolutionModal
        isOpen={isConflictOpen}
        onClose={handleCloseConflict}
        onConfirm={handleConfirmConflicts}
        bookings={affectedBookings}
        periods={periods}
        isSaving={isSaving}
      />
    </div>
  );
}
