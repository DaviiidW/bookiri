"use client";

import { useState, useEffect } from "react";
import type { Metadata } from "next";
import {
  LayoutGrid,
  List,
  Plus,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import SeasonCard, { Season } from "./_components/season-card";
import SeasonTable from "./_components/season-table";
import SeasonFormModal from "./_components/season-form-modal";
import SeasonDeleteModal from "./_components/season-delete-modal";

interface Property {
  id: string;
  name: string;
  color: string;
}

export default function TemporadasPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [seasonsRes, propsRes] = await Promise.all([
        fetch("/api/seasons"),
        fetch("/api/properties"),
      ]);
      const [seasonsData, propsData] = await Promise.all([
        seasonsRes.json(),
        propsRes.json(),
      ]);

      if (seasonsRes.ok && seasonsData.success) {
        setSeasons(seasonsData.seasons || []);
      } else {
        setError(seasonsData.error || "Error al cargar las temporadas");
      }

      if (propsRes.ok && propsData.success) {
        setProperties(
          (propsData.properties || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            color: p.color,
          }))
        );
      }
    } catch {
      setError("Error de conexión al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 4000);
  };

  const handleCreateClick = () => {
    setSelectedSeason(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (season: Season) => {
    setSelectedSeason(season);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (season: Season) => {
    setSelectedSeason(season);
    setIsDeleteOpen(true);
  };

  const handleFormSuccess = () => {
    showSuccess(selectedSeason ? "Temporada actualizada correctamente" : "Temporada creada correctamente");
    fetchData();
  };

  const handleDeleteSuccess = () => {
    showSuccess("Temporada eliminada correctamente");
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Temporadas</h1>
        </div>

        <div className="flex items-center gap-2">
          {properties.length > 0 && (
            <select
              value={selectedPropertyId ?? ""}
              onChange={(e) => setSelectedPropertyId(e.target.value || null)}
              className="text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="">Todas las viviendas</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "card"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Vista tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Vista tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleCreateClick}
            disabled={properties.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-lg shadow-indigo-900/30"
          >
            <Plus className="w-4 h-4" />
            Nueva temporada
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 text-xs font-medium animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!isLoading && properties.length === 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/30 text-amber-300 text-sm text-center">
          Antes de crear temporadas, debes tener al menos una vivienda registrada.
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span className="text-sm">Cargando temporadas...</span>
        </div>
      )}

      {!isLoading && seasons.length === 0 && properties.length > 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800">
            <Layers className="w-10 h-10 text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-400">No hay temporadas</p>
            <p className="text-xs text-slate-500 mt-1">
              Crea tu primera temporada para configurar precios y condiciones.
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Crear primera temporada
          </button>
        </div>
      )}

      {!isLoading && seasons.length > 0 && (
        <div className="space-y-8">
          {(selectedPropertyId
            ? properties.filter((p) => p.id === selectedPropertyId)
            : properties
          ).map((property) => {
            const propSeasons = seasons.filter((s) => s.property.id === property.id);

            return (
              <div key={property.id} className="space-y-4 pb-6 border-b border-slate-800/40 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: property.color }}
                  />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    {property.name}
                  </h2>
                  <span className="text-[10px] text-slate-500 font-semibold bg-slate-950 px-2 py-0.5 rounded-full">
                    {propSeasons.length} {propSeasons.length === 1 ? "temporada" : "temporadas"}
                  </span>
                </div>

                {propSeasons.length === 0 ? (
                  <p className="text-xs text-slate-500 italic pl-4">
                    No hay temporadas configuradas para esta vivienda.
                  </p>
                ) : (
                  <>
                    {viewMode === "card" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pl-4">
                        {propSeasons.map((season) => (
                          <SeasonCard
                            key={season.id}
                            season={season}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                          />
                        ))}
                      </div>
                    )}

                    {viewMode === "table" && (
                      <div className="overflow-x-auto rounded-2xl pl-4">
                        <SeasonTable
                          seasons={propSeasons}
                          onEdit={handleEditClick}
                          onDelete={handleDeleteClick}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <SeasonFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        season={selectedSeason}
        properties={properties}
      />

      <SeasonDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onSuccess={handleDeleteSuccess}
        season={selectedSeason}
      />
    </div>
  );
}
