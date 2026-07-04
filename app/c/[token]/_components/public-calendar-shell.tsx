"use client";

import { useState, useEffect, useCallback } from "react";
import type { PublicCalendarData, PublicProperty } from "../_types";
import { formatMonthLabel } from "../_types";
import PublicMonthView from "./public-month-view";

interface Props {
  token: string;
}

export default function PublicCalendarShell({ token }: Props) {
  const [data, setData] = useState<PublicCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/public/calendar/${token}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Error al cargar el calendario");
        return;
      }
      setData(json);
      if (json.properties.length > 0) {
        setSelectedPropertyId(json.properties[0].id);
      }
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedProperty: PublicProperty | null =
    data?.properties.find((p) => p.id === selectedPropertyId) ?? null;

  const prevMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-zinc-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-zinc-900 font-bold text-xl mb-2">Enlace no disponible</h1>
        <p className="text-zinc-500 text-sm max-w-sm">{error}</p>
      </div>
    );
  }

  if (!data || !selectedProperty) return null;

  const multipleProperties = data.properties.length > 1;

  return (
    <div className="min-h-screen bg-white text-zinc-800">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Calendario de disponibilidad
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            {data.name ?? "Disponibilidad"}
          </h1>
        </div>

        {multipleProperties && (
          <div className="flex flex-wrap gap-2 mb-6">
            {data.properties.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPropertyId(p.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  selectedPropertyId === p.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                {p.name}
              </button>
            ))}
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <span className="text-zinc-900 font-bold text-base sm:text-lg capitalize">
              {formatMonthLabel(currentDate)}
            </span>

            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <PublicMonthView
            currentDate={currentDate}
            property={selectedProperty}
            showPrice={data.showPrice}
            showSeasonPrices={data.showSeasonPrices}
          />
        </div>

        <p className="text-center text-[11px] text-zinc-400 mt-6">
          Información de disponibilidad en tiempo real · Powered by Bookiri
        </p>
      </div>
    </div>
  );
}
