import React from 'react';
import { RotateCcw } from 'lucide-react';

interface CompactSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
  onReset?: () => void;
  defaultValue?: number;
  ariaLabel?: string;
}

export default function CompactSlider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  onReset,
  defaultValue,
  ariaLabel,
}: CompactSliderProps) {
  const fill = ((value - min) / (max - min)) * 100;
  const isModified = defaultValue !== undefined && value !== defaultValue;

  return (
    <div className="group/slider rounded-md border border-zinc-900 bg-zinc-950/60 p-2.5 transition hover:border-zinc-800">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-medium text-zinc-300">{label}</label>
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-[11px] font-medium text-zinc-200 border border-zinc-800/80">
            {format(value)}
          </span>
          {isModified && onReset && (
            <button
              onClick={onReset}
              className="text-zinc-500 hover:text-zinc-300 transition p-0.5"
              title="Redefinir este ajuste"
              aria-label={`Redefinir ${label}`}
            >
              <RotateCcw size={11} />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={ariaLabel || label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        style={{ ['--fill' as string]: `${fill}%` }}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer focus-visible:ring-1 focus-visible:ring-zinc-400"
      />
    </div>
  );
}
