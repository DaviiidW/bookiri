"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ChevronRight, AlertTriangle, RefreshCw, DollarSign, Lock, Calendar, ArrowRight, Palette } from "lucide-react";
import { Season } from "./season-card";
import { formatShortDate, getNights } from "@/lib/date-format";
import DatePicker from "@/components/date-picker";
import SelectDropdown from "@/components/select-dropdown";
import MoneyStepperInput from "@/components/money-stepper-input";

interface Property {
  id: string;
  name: string;
  color: string;
}

interface AffectedBooking {
  id: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  propertyName: string;
  propertyColor: string;
  recalculatedPrice?: number;
}

type BookingActionType = "recalculate" | "keep" | "manual";

interface BookingAction {
  bookingId: string;
  action: BookingActionType;
  manualPrice?: number;
  recalculatedPrice?: number;
}

const PREDEFINED_COLORS = [
  { name: "Indigo", hex: "#6366f1" },
  { name: "Emerald", hex: "#10b981" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Cyan", hex: "#06b6d4" },
  { name: "Sky", hex: "#0ea5e9" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Orange", hex: "#f97316" },
  { name: "Pink", hex: "#ec4899" },
];

interface SeasonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  season?: Season | null;
  properties: Property[];
}

export default function SeasonFormModal({
  isOpen,
  onClose,
  onSuccess,
  season,
  properties,
}: SeasonFormModalProps) {
  const isEditMode = !!season;

  const [propertyId, setPropertyId] = useState("");
  const [name, setName] = useState("");
  const [color, setColor] = useState(PREDEFINED_COLORS[0].hex);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pricePerNight, setPricePerNight] = useState("");
  const [minimumStayNights, setMinimumStayNights] = useState("1");

  const [isCustomColor, setIsCustomColor] = useState(false);
  const [showCustomSliders, setShowCustomSliders] = useState(false);
  const [hue, setHue] = useState(180);
  const [saturation, setSaturation] = useState(70);
  const [lightness, setLightness] = useState(50);

  const parseHexToHsl = (hex: string) => {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const getCustomColorPreview = () => `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  const [step, setStep] = useState<"form" | "affected-price" | "affected-property">("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAffected, setIsCheckingAffected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [affectedBookings, setAffectedBookings] = useState<AffectedBooking[]>([]);
  const [bookingActions, setBookingActions] = useState<Record<string, BookingAction>>({});

  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setError(null);
      setAffectedBookings([]);
      setBookingActions({});
      if (season) {
        setPropertyId(season.property.id);
        setName(season.name);
        setStartDate(season.startDate.split("T")[0]);
        setEndDate(season.endDate.split("T")[0]);
        setPricePerNight(String(season.pricePerNight));
        setMinimumStayNights(String(season.minimumStayNights));

        const isPredefined = PREDEFINED_COLORS.some(
          (c) => c.hex.toLowerCase() === season.color.toLowerCase()
        );

        if (isPredefined) {
          setColor(season.color);
          setIsCustomColor(false);
          setShowCustomSliders(false);
        } else {
          setIsCustomColor(true);
          setShowCustomSliders(false);
          if (season.color.startsWith("hsl")) {
            const match = season.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
              setHue(parseInt(match[1], 10));
              setSaturation(parseInt(match[2], 10));
              setLightness(parseInt(match[3], 10));
            }
          } else if (season.color.startsWith("#")) {
            const hsl = parseHexToHsl(season.color);
            setHue(hsl.h);
            setSaturation(hsl.s);
            setLightness(hsl.l);
          }
        }
      } else {
        setPropertyId(properties[0]?.id ?? "");
        setName("");
        setColor(PREDEFINED_COLORS[0].hex);
        setIsCustomColor(false);
        setShowCustomSliders(false);
        setHue(180);
        setSaturation(70);
        setLightness(50);
        setStartDate("");
        setEndDate("");
        setPricePerNight("");
        setMinimumStayNights("1");
      }
    }
  }, [isOpen, season, properties]);

  if (!isOpen) return null;

  const priceChanged = isEditMode && parseFloat(pricePerNight) !== season!.pricePerNight;
  const dateChanged =
    isEditMode &&
    (startDate !== season!.startDate.split("T")[0] || endDate !== season!.endDate.split("T")[0]);
  const minStayChanged = isEditMode && parseInt(minimumStayNights, 10) !== season!.minimumStayNights;
  const propertyChanged = isEditMode && propertyId !== season!.property.id;
  const hasCriticalChange = priceChanged || dateChanged || minStayChanged;

  const fetchAffectedBookings = async (): Promise<AffectedBooking[]> => {
    if (!season) return [];
    setIsCheckingAffected(true);
    try {
      const params = new URLSearchParams({
        pricePerNight,
        startDate,
        endDate,
        propertyId
      });
      const res = await fetch(`/api/seasons/${season.id}/affected-bookings?${params.toString()}`);
      const data = await res.json();
      if (res.ok && data.success) return data.affectedBookings || [];
      return [];
    } catch {
      return [];
    } finally {
      setIsCheckingAffected(false);
    }
  };

  const initBookingActions = (bookings: AffectedBooking[]) => {
    const initial: Record<string, BookingAction> = {};
    for (const b of bookings) {
      initial[b.id] = {
        bookingId: b.id,
        action: "keep",
        recalculatedPrice: b.recalculatedPrice,
      };
    }
    setBookingActions(initial);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!propertyId) return setError("Selecciona una vivienda");
    if (!name.trim()) return setError("El nombre es obligatorio");
    if (!startDate || !endDate) return setError("Las fechas son obligatorias");
    if (new Date(startDate) >= new Date(endDate)) return setError("La fecha de inicio debe ser anterior a la de fin");
    const price = parseFloat(pricePerNight);
    if (isNaN(price) || price <= 0) return setError("El precio debe ser mayor que cero");
    const minStay = parseInt(minimumStayNights, 10);
    if (isNaN(minStay) || minStay < 1) return setError("La estancia mínima debe ser al menos 1 noche");

    if (isEditMode) {
      if (propertyChanged || dateChanged) {
        const affected = await fetchAffectedBookings();
        if (affected.length > 0) {
          setAffectedBookings(affected);
          setStep("affected-property");
          return;
        }
      } else if (priceChanged || minStayChanged) {
        const affected = await fetchAffectedBookings();
        if (affected.length > 0) {
          setAffectedBookings(affected);
          initBookingActions(affected);
          setStep("affected-price");
          return;
        }
      }
    }

    await submitSave([]);
  };

  const submitSave = async (actions: BookingAction[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const finalColor = isCustomColor
        ? `hsl(${hue}, ${saturation}%, ${lightness}%)`
        : color;

      const payload = {
        propertyId,
        name: name.trim(),
        color: finalColor,
        startDate,
        endDate,
        pricePerNight: parseFloat(pricePerNight),
        minimumStayNights: parseInt(minimumStayNights, 10),
        bookingActions: actions.map((a) => ({
          bookingId: a.bookingId,
          action: a.action,
          manualPrice: a.action === "manual" ? a.manualPrice : undefined,
        })),
      };

      const url = isEditMode ? `/api/seasons/${season!.id}` : "/api/seasons";
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Error al guardar la temporada");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceStepSave = () => {
    const actions = Object.values(bookingActions);
    submitSave(actions);
  };

  const handlePropertyStepConfirm = () => {
    submitSave([]);
  };

  const updateBookingAction = (bookingId: string, field: Partial<BookingAction>) => {
    setBookingActions((prev) => ({
      ...prev,
      [bookingId]: { ...prev[bookingId], ...field },
    }));
  };


  const modalTitle =
    step === "form"
      ? isEditMode ? "Editar temporada" : "Nueva temporada"
      : step === "affected-price"
      ? "Reservas afectadas"
      : "Cambio de vivienda";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-200 flex-shrink-0">
          <h2 className="text-base font-bold text-zinc-900">{modalTitle}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {step === "form" && (
          <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Vivienda
                </label>
                <SelectDropdown
                  options={properties.map((p) => ({ value: p.id, label: p.name }))}
                  value={propertyId}
                  onChange={setPropertyId}
                  placeholder="Selecciona una vivienda..."
                  triggerClassName="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Temporada Alta, Navidad..."
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Color Identificativo
                </label>

                <div className="grid grid-cols-6 sm:grid-cols-11 gap-2 mb-4">
                  {PREDEFINED_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => {
                        setColor(c.hex);
                        setIsCustomColor(false);
                        setShowCustomSliders(false);
                      }}
                      className={`w-full aspect-square rounded-full transition-transform cursor-pointer border ${
                        !isCustomColor && color.toLowerCase() === c.hex.toLowerCase()
                          ? "scale-110 ring-2 ring-indigo-500 ring-offset-2 border-transparent"
                          : "border-zinc-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      if (isCustomColor) {
                        setShowCustomSliders((prev) => !prev);
                      } else {
                        setIsCustomColor(true);
                        setShowCustomSliders(true);
                      }
                    }}
                    className={`w-full aspect-square rounded-full transition-transform cursor-pointer border relative overflow-hidden ${
                      isCustomColor
                        ? "scale-110 ring-2 ring-indigo-500 ring-offset-2 border-transparent"
                        : "border-zinc-200 hover:scale-105"
                    }`}
                    style={{
                      background: isCustomColor
                        ? getCustomColorPreview()
                        : "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                    }}
                    title="Color Personalizado"
                  >
                    <Palette className="w-3.5 h-3.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
                  </button>
                </div>

                {showCustomSliders && (
                  <div className="p-4 border border-zinc-200 bg-zinc-50 rounded-2xl space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl border border-zinc-200 flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: getCustomColorPreview() }}
                      />
                      <div className="text-xs">
                        <p className="font-bold text-zinc-800">Color Personalizado</p>
                        <p className="font-mono text-[10px] text-zinc-500 uppercase">{getCustomColorPreview()}</p>
                      </div>
                    </div>

                    <div className="space-y-3.5 pt-2 border-t border-zinc-200">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          <span>Tono</span>
                          <span className="font-mono text-zinc-700">{hue}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={hue}
                          onChange={(e) => setHue(parseInt(e.target.value, 10))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none"
                          style={{
                            background: "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                          }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          <span>Saturación</span>
                          <span className="font-mono text-zinc-700">{saturation}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={saturation}
                          onChange={(e) => setSaturation(parseInt(e.target.value, 10))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none"
                          style={{
                            background: `linear-gradient(to right, hsl(${hue}, 0%, ${lightness}%), hsl(${hue}, 100%, ${lightness}%))`,
                          }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          <span>Brillo</span>
                          <span className="font-mono text-zinc-700">{lightness}%</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="85"
                          value={lightness}
                          onChange={(e) => setLightness(parseInt(e.target.value, 10))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none"
                          style={{
                            background: `linear-gradient(to right, #050505 0%, hsl(${hue}, ${saturation}%, 50%) 50%, #fafafa 100%)`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Fecha de inicio
                  </label>
                  <DatePicker
                    value={startDate}
                    onChange={setStartDate}
                    triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Fecha de fin
                  </label>
                  <DatePicker
                    value={endDate}
                    onChange={setEndDate}
                    min={startDate}
                    triggerClassName="w-full flex items-center justify-between gap-2 pl-3 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Precio por noche (€)
                  </label>
                  <div className="flex items-center pl-4 pr-2 py-1 bg-zinc-50 border border-zinc-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500">
                    <MoneyStepperInput
                      value={pricePerNight}
                      onChange={setPricePerNight}
                      placeholder="0.00"
                      required
                      inputClassName="w-full py-1.5 bg-transparent text-zinc-800 text-sm placeholder-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Estancia mínima (noches)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={minimumStayNights}
                    onChange={(e) => setMinimumStayNights(e.target.value)}
                    placeholder="1"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading || isCheckingAffected}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none min-w-[120px] justify-center"
              >
                {isLoading || isCheckingAffected ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    {isEditMode ? "Guardar cambios" : "Crear temporada"}
                    {isEditMode && hasCriticalChange && <ChevronRight className="w-3.5 h-3.5" />}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {step === "affected-price" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  {affectedBookings.length} reserva{affectedBookings.length > 1 ? "s" : ""} afectada{affectedBookings.length > 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-amber-700/80 leading-relaxed">
                  Has modificado el precio, las fechas o la estancia mínima. Elige qué hacer con cada reserva que usa esta temporada.
                </p>
              </div>

              <div className="space-y-3">
                {affectedBookings.map((booking) => {
                  const ba = bookingActions[booking.id];
                  const nights = getNights(booking.checkInDate, booking.checkOutDate);
                  return (
                    <div key={booking.id} className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
                      <div className="flex items-start gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: booking.propertyColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-800">{booking.guestName}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatShortDate(booking.checkInDate)}
                            <ArrowRight className="w-2.5 h-2.5" />
                            {formatShortDate(booking.checkOutDate)}
                            <span>· {nights} noches</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-zinc-700 flex-shrink-0">
                          {booking.totalPrice}€ actual
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { value: "recalculate" as BookingActionType, icon: RefreshCw, label: "Recalcular", sub: `${ba?.recalculatedPrice?.toFixed(2)}€` },
                          { value: "keep" as BookingActionType, icon: Lock, label: "Mantener", sub: `${booking.totalPrice}€` },
                          { value: "manual" as BookingActionType, icon: DollarSign, label: "Manual", sub: "Introduce precio" },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => updateBookingAction(booking.id, { action: opt.value })}
                            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-center transition-all cursor-pointer ${
                              ba?.action === opt.value
                                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                                : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300"
                            }`}
                          >
                            <opt.icon className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">{opt.label}</span>
                            <span className="text-[9px] opacity-70">{opt.sub}</span>
                          </button>
                        ))}
                      </div>

                      {ba?.action === "manual" && (
                        <div className="flex items-center pl-3 pr-1.5 py-0.5 bg-white border border-zinc-200 rounded-lg focus-within:ring-1 focus-within:ring-indigo-500">
                          <MoneyStepperInput
                            value={ba.manualPrice != null ? String(ba.manualPrice) : ""}
                            onChange={(v) => updateBookingAction(booking.id, { manualPrice: parseFloat(v) })}
                            placeholder="Nuevo precio total (€)"
                            inputClassName="w-full py-1.5 bg-transparent text-zinc-800 text-xs placeholder-zinc-400 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 flex-shrink-0">
              <button
                onClick={() => setStep("form")}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                ← Volver
              </button>
              <button
                onClick={handlePriceStepSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none min-w-[160px] justify-center"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Guardar y aplicar"}
              </button>
            </div>
          </div>
        )}

        {step === "affected-property" && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      {propertyChanged ? "Cambio de vivienda" : "Cambio de fechas de la temporada"}
                    </p>
                    <p className="text-[11px] text-amber-700/80 leading-relaxed mt-1">
                      Las reservas conservarán el precio que tenían asignado cuando fueron creadas salvo que el administrador decida recalcularlas.
                    </p>
                  </div>
                </div>
              </div>

              {affectedBookings.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-semibold">
                    {affectedBookings.length} reserva{affectedBookings.length > 1 ? "s" : ""} afectada{affectedBookings.length > 1 ? "s" : ""}:
                  </p>
                  {affectedBookings.map((b) => (
                    <div key={b.id} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: b.propertyColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-zinc-800">{b.guestName}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatShortDate(b.checkInDate)}
                          <ArrowRight className="w-2.5 h-2.5" />
                          {formatShortDate(b.checkOutDate)}
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-zinc-700">{b.totalPrice}€</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No hay reservas futuras afectadas.</p>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 flex-shrink-0">
              <button
                onClick={() => setStep("form")}
                className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors cursor-pointer"
              >
                ← Volver
              </button>
              <button
                onClick={handlePropertyStepConfirm}
                disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none min-w-[160px] justify-center"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Confirmar cambio"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
