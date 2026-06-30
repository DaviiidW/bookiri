"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid,
  List,
  Plus,
  Building,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import PropertyFormModal from "./_components/property-form-modal";
import PropertyDeleteModal from "./_components/property-delete-modal";
import PropertyCard from "./_components/property-card";
import PropertyTable from "./_components/property-table";

interface Property {
  id: string;
  name: string;
  color: string;
  maxGuests: number;
  availabilityPeriods: {
    id: string;
    startDate: string;
    endDate: string;
    description: string | null;
  }[];
  isAvailableNow: boolean;
  isBookedNow: boolean;
  nextBooking: {
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  } | null;
  futureBookingsCount: number;
}

export default function ViviendasPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [expandedProps, setExpandedProps] = useState<Record<string, boolean>>({});

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/properties");
      const data = await response.json();
      if (response.ok && data.success) {
        setProperties(data.properties || []);
      } else {
        setError(data.error || "No se pudieron cargar las viviendas.");
      }
    } catch (err) {
      setError("Error de conexión al cargar las viviendas.");
      console.error("Fetch properties error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreateClick = () => {
    setSelectedProperty(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (property: Property) => {
    setSelectedProperty(property);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDeleteOpen(true);
  };

  const toggleExpand = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setExpandedProps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const triggerSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 4000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Viviendas
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "card"
                  ? "bg-slate-800 text-indigo-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Vista de Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-slate-800 text-indigo-400"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Vista de Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl shadow-lg shadow-indigo-650/10 cursor-pointer transition-all duration-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Vivienda</span>
          </button>
        </div>
      </div>

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

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 space-y-4 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-6 w-1/2 bg-slate-800 rounded-lg" />
                <div className="h-4 w-4 bg-slate-800 rounded-full" />
              </div>
              <div className="h-4 w-1/3 bg-slate-800 rounded-lg" />
              <div className="pt-4 flex gap-2 justify-end border-t border-slate-900/60">
                <div className="h-8 w-16 bg-slate-800 rounded-lg" />
                <div className="h-8 w-16 bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-12 text-center shadow-xl">
          <div className="max-w-md mx-auto flex flex-col items-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950/60 border border-indigo-850 flex items-center justify-center text-indigo-400 mb-6">
              <Building className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No tienes viviendas</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Registra tu primera vivienda vacacional para comenzar a gestionar tus reservas, calendarios y tarifas de precios.
            </p>
            <button
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-indigo-650 hover:bg-indigo-550 text-white rounded-xl shadow-lg cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear mi primera vivienda</span>
            </button>
          </div>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              isExpanded={!!expandedProps[p.id]}
              onToggleExpand={(e) => toggleExpand(e, p.id)}
              onEdit={() => handleEditClick(p)}
              onDelete={() => handleDeleteClick(p)}
            />
          ))}
        </div>
      ) : (
        <PropertyTable
          properties={properties}
          expandedProps={expandedProps}
          onToggleExpand={toggleExpand}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <PropertyFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => {
          fetchProperties();
          triggerSuccess(
            selectedProperty
              ? "Vivienda actualizada correctamente."
              : "Vivienda creada correctamente."
          );
        }}
        property={selectedProperty}
      />

      <PropertyDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={() => {
          fetchProperties();
          triggerSuccess("Vivienda eliminada correctamente.");
        }}
        property={selectedProperty}
      />
    </div>
  );
}
