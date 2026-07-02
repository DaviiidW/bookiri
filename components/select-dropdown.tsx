"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption<T extends string | null = string> {
  value: T;
  label: string;
}

interface SelectDropdownProps<T extends string | null = string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
}

const DEFAULT_TRIGGER_CLASSNAME =
  "w-full flex items-center justify-between gap-2 text-xs bg-white border border-zinc-200 text-zinc-800 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-zinc-100 disabled:border-zinc-200 disabled:text-zinc-400";

export default function SelectDropdown<T extends string | null = string>({
  options,
  value,
  onChange,
  placeholder = "Selecciona una opción",
  disabled = false,
  className = "",
  triggerClassName = DEFAULT_TRIGGER_CLASSNAME,
}: SelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`${triggerClassName} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 min-w-full bg-white border border-zinc-200 rounded-lg shadow-lg p-1.5 z-50 max-h-64 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value ?? ""}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-md text-xs whitespace-nowrap cursor-pointer transition-colors
                ${opt.value === value
                  ? "bg-zinc-200 text-zinc-900 font-semibold"
                  : "text-zinc-700 hover:bg-zinc-100"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
