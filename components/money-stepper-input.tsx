"use client";

import type { ReactNode } from "react";
import { Plus, Minus } from "lucide-react";

interface MoneyStepperInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  step?: number;
  increment?: number;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  inputClassName: string;
  buttonClassName?: string;
  suffix?: ReactNode;
}

export default function MoneyStepperInput({
  id,
  value,
  onChange,
  min = 0,
  step = 5,
  increment = 10,
  disabled = false,
  required = false,
  placeholder,
  inputClassName,
  buttonClassName = "p-1 rounded-md text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none",
  suffix,
}: MoneyStepperInputProps) {
  const adjust = (delta: number) => {
    const current = parseFloat(value) || 0;
    const next = Math.max(min, Math.round((current + delta) * 100) / 100);
    onChange(String(next));
  };

  return (
    <div className="flex items-center gap-0.5">
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClassName} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />
      {suffix}
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={() => adjust(-increment)}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Restar"
          className={buttonClassName}
        >
          <Minus className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => adjust(increment)}
          disabled={disabled}
          tabIndex={-1}
          aria-label="Sumar"
          className={buttonClassName}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
