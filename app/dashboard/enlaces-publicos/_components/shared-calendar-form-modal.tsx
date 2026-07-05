"use client";

import { useState, useEffect } from "react";
import type { SharedCalendar, SharedCalendarPriceRule } from "./shared-calendars-shell";
import DatePicker from "@/components/date-picker";
import MoneyStepperInput from "@/components/money-stepper-input";

interface Property {
  id: string;
  name: string;
  color: string;
}

interface DraftRule {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  pricePerNight: string;
  daysOfWeek: number[];
  propertyId: string;
}

interface Props {
  calendar: SharedCalendar | null;
  onClose: () => void;
  onSave: () => void;
}

const DOW = [
  { iso: 1, label: "L" },
  { iso: 2, label: "M" },
  { iso: 3, label: "X" },
  { iso: 4, label: "J" },
  { iso: 5, label: "V" },
  { iso: 6, label: "S" },
  { iso: 7, label: "D" },
];

const WEEKDAYS = [1, 2, 3, 4, 5];
const WEEKEND = [6, 7];
const ALL_DAYS: number[] = [];

function makeDraftRule(propertyId: string): DraftRule {
  return {
    id: crypto.randomUUID(),
    label: "",
    startDate: "",
    endDate: "",
    pricePerNight: "",
    daysOfWeek: ALL_DAYS,
    propertyId,
  };
}

function dbRuleToDraft(r: SharedCalendarPriceRule): DraftRule {
  return {
    id: r.id,
    label: r.label ?? "",
    startDate: r.startDate.split("T")[0],
    endDate: r.endDate.split("T")[0],
    pricePerNight: String(r.pricePerNight),
    daysOfWeek: r.daysOfWeek ?? [],
    propertyId: r.propertyId,
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(price);
}

function arraysEqual(a: number[], b: number[]) {
  return a.length === b.length && a.every((v) => b.includes(v));
}

function DowSelector({
  value,
  onChange,
}: {
  value: number[];
  onChange: (v: number[]) => void;
}) {
  const isAll = value.length === 0;
  const isWeekdays = arraysEqual(value, WEEKDAYS);
  const isWeekend = arraysEqual(value, WEEKEND);

  const toggleDay = (iso: number) => {
    if (isAll) {
      onChange(DOW.filter((d) => d.iso !== iso).map((d) => d.iso));
    } else {
      const next = value.includes(iso) ? value.filter((v) => v !== iso) : [...value, iso];
      onChange(next.length === 7 ? [] : next);
    }
  };

  const isSelected = (iso: number) => value.length === 0 || value.includes(iso);

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {(
          [
            { label: "Todos", v: ALL_DAYS, active: isAll },
            { label: "L–V", v: WEEKDAYS, active: isWeekdays },
            { label: "S–D", v: WEEKEND, active: isWeekend },
          ] as const
        ).map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.v as unknown as number[])}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
              preset.active
                ? "bg-violet-600 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex gap-1">
        {DOW.map((d) => (
          <button
            key={d.iso}
            type="button"
            onClick={() => toggleDay(d.iso)}
            className={`flex-1 h-8 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              isSelected(d.iso)
                ? "bg-violet-600/80 text-white"
                : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SharedCalendarFormModal({ calendar, onClose, onSave }: Props) {
  const isEditing = !!calendar;

  const [name, setName] = useState(calendar?.name ?? "");
  const [showPrice, setShowPrice] = useState(calendar?.showPrice ?? false);
  const [showSeasonPrices, setShowSeasonPrices] = useState(calendar?.showSeasonPrices ?? false);
  const [expiresAt, setExpiresAt] = useState(
    calendar?.expiresAt ? new Date(calendar.expiresAt).toISOString().split("T")[0] : ""
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(
    calendar?.properties.map((p) => p.property.id) ?? []
  );
  const [priceRules, setPriceRules] = useState<DraftRule[]>(
    calendar?.priceRules.map(dbRuleToDraft) ?? []
  );
  const [properties, setProperties] = useState<Property[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((d) => {
        const props = d.properties ?? [];
        setProperties(props);
        if (props.length > 0 && !isEditing) {
        }
      });
  }, [isEditing]);

  useEffect(() => {
    setPriceRules((prev) => prev.filter((r) => selectedIds.includes(r.propertyId)));
  }, [selectedIds]);

  useEffect(() => {
    if (expandedPropertyId && !selectedIds.includes(expandedPropertyId)) {
      setExpandedPropertyId(selectedIds[0] || null);
    } else if (!expandedPropertyId && selectedIds.length > 0 && priceRules.length === 0) {
      setExpandedPropertyId(selectedIds[0]);
    }
  }, [selectedIds]);

  const toggleProperty = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const addRule = (propertyId: string) => {
    setPriceRules((prev) => [...prev, makeDraftRule(propertyId)]);
  };

  const removeRule = (id: string) => setPriceRules((prev) => prev.filter((r) => r.id !== id));

  const updateRule = (id: string, field: keyof DraftRule, value: unknown) =>
    setPriceRules((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const validateRules = (): string | null => {
    for (const r of priceRules) {
      if (!r.startDate || !r.endDate) return "Todos los tramos necesitan fecha de inicio y fin.";
      if (new Date(r.endDate) < new Date(r.startDate))
        return "La fecha de fin debe ser posterior a la de inicio.";
      const price = parseFloat(r.pricePerNight);
      if (isNaN(price) || price <= 0) return "El precio por noche debe ser mayor que 0.";
    }

    const rulesByProperty: Record<string, DraftRule[]> = {};
    for (const r of priceRules) {
      if (!rulesByProperty[r.propertyId]) {
        rulesByProperty[r.propertyId] = [];
      }
      rulesByProperty[r.propertyId].push(r);
    }

    for (const propertyId in rulesByProperty) {
      const propRules = rulesByProperty[propertyId];
      const propertyName = properties.find((p) => p.id === propertyId)?.name || "Vivienda";

      for (let i = 0; i < propRules.length; i++) {
        for (let j = i + 1; j < propRules.length; j++) {
          const a = propRules[i];
          const b = propRules[j];
          if (!a.startDate || !a.endDate || !b.startDate || !b.endDate) continue;

          const datesOverlap =
            new Date(a.startDate) <= new Date(b.endDate) &&
            new Date(b.startDate) <= new Date(a.endDate);

          if (!datesOverlap) continue;

          const aDays = a.daysOfWeek.length === 0 ? [1, 2, 3, 4, 5, 6, 7] : a.daysOfWeek;
          const bDays = b.daysOfWeek.length === 0 ? [1, 2, 3, 4, 5, 6, 7] : b.daysOfWeek;
          const daysOverlap = aDays.some((d) => bDays.includes(d));

          if (daysOverlap) {
            const nameA = a.label.trim() || `Tramo ${i + 1}`;
            const nameB = b.label.trim() || `Tramo ${j + 1}`;
            return `En "${propertyName}", los tramos "${nameA}" y "${nameB}" se solapan en fechas y días de semana.`;
          }
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) { setError("Selecciona al menos una vivienda."); return; }
    if (showPrice) {
      const ruleError = validateRules();
      if (ruleError) { setError(ruleError); return; }
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      name: name.trim() || null,
      propertyIds: selectedIds,
      showPrice,
      showSeasonPrices: showPrice ? showSeasonPrices : false,
      expiresAt: expiresAt || null,
      priceRules: showPrice
        ? priceRules.map((r) => ({
            label: r.label.trim() || null,
            startDate: r.startDate,
            endDate: r.endDate,
            pricePerNight: parseFloat(r.pricePerNight),
            daysOfWeek: r.daysOfWeek,
            propertyId: r.propertyId,
          }))
        : [],
    };

    const url = isEditing ? `/api/shared-calendars/${calendar.id}` : "/api/shared-calendars";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      let message = "Error desconocido";
      try { const data = JSON.parse(text); message = data.error ?? message; } catch {
        message = `Error del servidor (${res.status})`;
      }
      setError(message);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    onSave();
  };

  const selectedProperties = properties.filter((p) => selectedIds.includes(p.id));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-zinc-200 shrink-0">
          <h2 className="text-zinc-900 font-bold text-lg">
            {isEditing ? "Editar enlace" : "Nuevo enlace compartido"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-all cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                Nombre del enlace <span className="text-zinc-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Clientes verano 2025"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-2">
                Viviendas incluidas <span className="text-red-500">*</span>
              </label>
              {properties.length === 0 ? (
                <p className="text-zinc-500 text-sm">Cargando viviendas…</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {properties.map((p) => (
                    <label
                      key={p.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedIds.includes(p.id)
                          ? "border-violet-300 bg-violet-50"
                          : "border-zinc-200 bg-zinc-50 hover:border-zinc-300"
                      }`}
                    >
                      <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleProperty(p.id)} className="sr-only" />
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-sm text-zinc-800 flex-1">{p.name}</span>
                      {selectedIds.includes(p.id) && (
                        <svg className="w-4 h-4 text-violet-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5">
                Fecha de expiración <span className="text-zinc-400">(opcional)</span>
              </label>
              <DatePicker
                value={expiresAt}
                onChange={setExpiresAt}
                min={new Date().toISOString().split("T")[0]}
                triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all text-sm"
              />
            </div>

            <div className="border border-zinc-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => { setShowPrice((v) => !v); }}
                className="w-full flex items-center justify-between p-4 bg-zinc-50 hover:bg-zinc-100 transition-all cursor-pointer"
              >
                <div className="text-left">
                  <p className="text-sm text-zinc-800 font-medium">Mostrar precios por noche</p>
                  <p className="text-xs text-zinc-500 mt-0.5">Configura tramos con precio visible para el visitante.</p>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${showPrice ? "bg-violet-600" : "bg-zinc-300"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${showPrice ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </button>

              {showPrice && (
                <div className="border-t border-zinc-200 divide-y divide-zinc-200">
                  <button
                    type="button"
                    onClick={() => setShowSeasonPrices((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-all cursor-pointer"
                  >
                    <div className="text-left">
                      <p className="text-xs text-zinc-700 font-medium">Mostrar precios de temporada como base</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Días sin tramo configurado mostrarán el precio de la temporada interna (en azul).
                      </p>
                    </div>
                    <div className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ml-3 ${showSeasonPrices ? "bg-sky-600" : "bg-zinc-300"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showSeasonPrices ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </button>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Tramos de precio</p>
                    </div>

                    {selectedProperties.length === 0 && (
                      <p className="text-xs text-zinc-500 italic text-center py-2">
                        Selecciona al menos una vivienda para configurar sus precios.
                      </p>
                    )}

                    {selectedProperties.map((prop) => {
                      const propRules = priceRules.filter((r) => r.propertyId === prop.id);
                      const isExpanded = expandedPropertyId === prop.id;

                      return (
                        <div key={prop.id} className="border border-zinc-200 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => setExpandedPropertyId(isExpanded ? null : prop.id)}
                            className="w-full flex items-center justify-between p-3 bg-zinc-50 hover:bg-zinc-100 transition-all text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: prop.color }} />
                              <span className="text-xs font-bold text-zinc-800">{prop.name}</span>
                              <span className="text-[10px] text-zinc-500">({propRules.length} tramos)</span>
                            </div>
                            <svg
                              className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>

                          {isExpanded && (
                            <div className="p-3 bg-white border-t border-zinc-200 space-y-3">
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => addRule(prop.id)}
                                  className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Añadir tramo
                                </button>
                              </div>

                              {propRules.length === 0 && (
                                <p className="text-xs text-zinc-400 italic text-center py-2">
                                  {showSeasonPrices
                                    ? "Sin tramos. Se usarán los precios de temporada."
                                    : "Sin tramos configurados. Los días no mostrarán precio."}
                                </p>
                              )}

                              {propRules.map((rule) => (
                                <div key={rule.id} className="bg-zinc-50 border border-zinc-200 rounded-xl p-3 space-y-2.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <input
                                      type="text"
                                      value={rule.label}
                                      onChange={(e) => updateRule(rule.id, "label", e.target.value)}
                                      placeholder="Etiqueta (ej: Fin de semana)"
                                      className="flex-1 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-800 placeholder-zinc-400 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeRule(rule.id)}
                                      className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer shrink-0"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] text-zinc-500 mb-1">Desde</label>
                                      <DatePicker
                                        value={rule.startDate}
                                        onChange={(v) => updateRule(rule.id, "startDate", v)}
                                        triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] text-zinc-500 mb-1">Hasta</label>
                                      <DatePicker
                                        value={rule.endDate}
                                        onChange={(v) => updateRule(rule.id, "endDate", v)}
                                        min={rule.startDate}
                                        triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] text-zinc-500 mb-1">Precio por noche (€)</label>
                                    <div className="flex items-center pl-2.5 pr-1.5 py-0.5 bg-white border border-zinc-200 rounded-lg focus-within:ring-1 focus-within:ring-violet-500/50">
                                      <span className="text-zinc-400 text-xs shrink-0">€</span>
                                      <MoneyStepperInput
                                        value={rule.pricePerNight}
                                        onChange={(v) => updateRule(rule.id, "pricePerNight", v)}
                                        min={1}
                                        placeholder="0"
                                        inputClassName="w-full pl-1 py-1.5 bg-transparent text-zinc-800 placeholder-zinc-400 text-xs focus:outline-none"
                                      />
                                    </div>
                                    {rule.pricePerNight && !isNaN(parseFloat(rule.pricePerNight)) && (
                                      <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                                        {formatPrice(parseFloat(rule.pricePerNight))}/noche
                                      </p>
                                    )}
                                  </div>

                                  <div>
                                    <label className="block text-[10px] text-zinc-500 mb-1.5">Días de la semana</label>
                                    <DowSelector
                                      value={rule.daysOfWeek}
                                      onChange={(v) => updateRule(rule.id, "daysOfWeek", v)}
                                    />
                                    <p className="text-[10px] text-zinc-400 mt-1">
                                      {rule.daysOfWeek.length === 0
                                        ? "Aplica todos los días"
                                        : `Aplica solo: ${rule.daysOfWeek.sort().map((d) => ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][d]).join(", ")}`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-end p-6 pt-0 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none min-w-[110px] flex items-center justify-center cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isEditing ? "Guardar cambios" : "Crear enlace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
