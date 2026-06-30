"use client";

import { useState, useEffect } from "react";
import { X, Palette } from "lucide-react";

interface Property {
  id: string;
  name: string;
  color: string;
  maxGuests: number;
}

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property?: Property | null;
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
];

export default function PropertyFormModal({
  isOpen,
  onClose,
  onSuccess,
  property,
}: PropertyFormModalProps) {
  const [name, setName] = useState("");
  
  const [color, setColor] = useState(PREDEFINED_COLORS[0].hex);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [hue, setHue] = useState(180);
  const [saturation, setSaturation] = useState(70);
  const [lightness, setLightness] = useState(50);

  const [maxGuests, setMaxGuests] = useState<number>(2);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!property;

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
    let h = 0, s = 0, l = (max + min) / 2;

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

  useEffect(() => {
    if (isOpen) {
      if (property) {
        setName(property.name);
        setMaxGuests(property.maxGuests);

        const isPredefined = PREDEFINED_COLORS.some(
          (c) => c.hex.toLowerCase() === property.color.toLowerCase()
        );

        if (isPredefined) {
          setColor(property.color);
          setIsCustomColor(false);
        } else {
          setIsCustomColor(true);
          if (property.color.startsWith("hsl")) {
            const match = property.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
            if (match) {
              setHue(parseInt(match[1], 10));
              setSaturation(parseInt(match[2], 10));
              setLightness(parseInt(match[3], 10));
            }
          } else if (property.color.startsWith("#")) {
            const hsl = parseHexToHsl(property.color);
            setHue(hsl.h);
            setSaturation(hsl.s);
            setLightness(hsl.l);
          }
        }
      } else {
        setName("");
        setColor(PREDEFINED_COLORS[0].hex);
        setIsCustomColor(false);
        setHue(180);
        setSaturation(70);
        setLightness(50);
        setMaxGuests(2);
      }
      setError(null);
    }
  }, [isOpen, property]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const finalColor = isCustomColor 
      ? `hsl(${hue}, ${saturation}%, ${lightness}%)` 
      : color;

    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      setIsLoading(false);
      return;
    }

    if (maxGuests <= 0) {
      setError("La capacidad máxima debe ser mayor que cero.");
      setIsLoading(false);
      return;
    }

    try {
      const url = isEditMode ? `/api/properties/${property.id}` : "/api/properties";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          color: finalColor,
          maxGuests,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || "Ocurrió un error al guardar la vivienda.");
      }
    } catch (err) {
      setError("Error de conexión. Inténtalo de nuevo.");
      console.error("Property form error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCustomColorPreview = () => `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">
          {isEditMode ? "Editar Vivienda" : "Crear Nueva Vivienda"}
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-200 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
              Nombre de la Vivienda
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Villa Paraíso, Apartamento Centro"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-slate-200 placeholder-slate-650 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
          </div>

            <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
              Capacidad Máxima de Huéspedes
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMaxGuests((prev) => Math.max(1, prev - 1))}
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-slate-350 hover:text-white font-bold flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 select-none text-lg"
              >
                -
              </button>
              <div className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-center text-slate-250 text-sm font-semibold select-none">
                {maxGuests}
              </div>
              <button
                type="button"
                onClick={() => setMaxGuests((prev) => prev + 1)}
                className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-slate-350 hover:text-white font-bold flex items-center justify-center cursor-pointer transition-all duration-150 active:scale-95 select-none text-lg"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
              Color Identificativo
            </label>
            
            <div className="grid grid-cols-9 gap-2 mb-4">
              {PREDEFINED_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    setColor(c.hex);
                    setIsCustomColor(false);
                  }}
                  className={`w-full aspect-square rounded-full transition-transform cursor-pointer border ${
                    !isCustomColor && color.toLowerCase() === c.hex.toLowerCase()
                      ? "scale-110 ring-2 ring-white border-transparent"
                      : "border-slate-850 hover:scale-105"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}

              <button
                type="button"
                onClick={() => setIsCustomColor(true)}
                className={`w-full aspect-square rounded-full transition-transform cursor-pointer border relative overflow-hidden ${
                  isCustomColor
                    ? "scale-110 ring-2 ring-white border-transparent"
                    : "border-slate-850 hover:scale-105"
                }`}
                style={{
                  background: isCustomColor 
                    ? getCustomColorPreview()
                    : "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                }}
                title="Color Personalizado"
              >
                <Palette className={`w-3.5 h-3.5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/90 ${isCustomColor ? "hidden" : "block"}`} />
              </button>
            </div>

            {isCustomColor && (
              <div className="p-4 border border-slate-850 bg-slate-950/50 rounded-2xl space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl border border-white/10 flex-shrink-0 shadow-lg"
                    style={{ backgroundColor: getCustomColorPreview() }}
                  />
                  <div className="text-xs">
                    <p className="font-bold text-slate-200">Color Personalizado</p>
                    <p className="font-mono text-[10px] text-slate-450 uppercase">{getCustomColorPreview()}</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-slate-850/60">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      <span>Tono</span>
                      <span className="font-mono text-slate-350">{hue}°</span>
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
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      <span>Saturación</span>
                      <span className="font-mono text-slate-350">{saturation}%</span>
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
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-450">
                      <span>Brillo</span>
                      <span className="font-mono text-slate-350">{lightness}%</span>
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

          <div className="flex items-center gap-3 justify-end pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-450 hover:text-slate-250 transition-colors cursor-pointer"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-semibold bg-indigo-650 hover:bg-indigo-550 text-white rounded-lg transition-colors cursor-pointer flex items-center justify-center min-w-[100px]"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-white rounded-full animate-spin" />
              ) : isEditMode ? (
                "Guardar"
              ) : (
                "Crear Vivienda"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
