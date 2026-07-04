"use client";

import { useState } from "react";
import type { SharedCalendar } from "./shared-calendars-shell";

interface Props {
  calendar: SharedCalendar;
  onEdit: (c: SharedCalendar) => void;
  onDelete: (id: string) => void;
}

function StatusBadge({ calendar }: { calendar: SharedCalendar }) {
  const expired =
    calendar.expiresAt && new Date(calendar.expiresAt) < new Date();
  if (expired)
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">
        Expirado
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
      Activo
    </span>
  );
}

export default function SharedCalendarCard({ calendar, onEdit, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const publicUrl = `${window.location.origin}/c/${calendar.token}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-zinc-300 transition-all w-full max-w-full overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-zinc-900 font-semibold truncate text-base">
              {calendar.name || "Sin nombre"}
            </span>
            <StatusBadge calendar={calendar} />
            {calendar.showPrice && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-violet-50 text-violet-700 border border-violet-200">
                Precios visibles
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {calendar.properties.map(({ property }) => (
              <span
                key={property.id}
                className="flex items-center gap-1 text-[11px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: property.color }}
                />
                {property.name}
              </span>
            ))}
          </div>
          {calendar.expiresAt && (
            <p className="mt-1.5 text-[11px] text-zinc-500">
              Expira:{" "}
              {new Date(calendar.expiresAt).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-start md:self-auto">
          <button
            onClick={handleCopy}
            title="Copiar enlace"
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
          >
            {copied ? (
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => onEdit(calendar)}
            title="Editar"
            className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Eliminar"
            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-zinc-100 overflow-hidden">
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-zinc-500 hover:text-violet-600 transition-colors font-mono block break-all whitespace-normal"
        >
          {publicUrl}
        </a>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-zinc-900 font-bold text-lg mb-2">¿Eliminar enlace?</h3>
            <p className="text-zinc-500 text-sm mb-5">
              Se eliminará permanentemente. Cualquiera que tenga el enlace dejará de poder acceder.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDelete(calendar.id);
                }}
                className="px-4 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
