import type { ReactNode } from "react";

/** Pill-shaped toggle button, styled for dark (navy) panels. */
export function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
        active
          ? "bg-white text-navy shadow-md"
          : "bg-white/10 text-white/85 ring-1 ring-white/15 hover:bg-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

interface SegmentedControlProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** A row of mutually exclusive options, styled for dark (navy) panels. */
export function SegmentedControl<T extends string>({ label, options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="inline-flex self-start rounded-xl bg-white/10 p-1" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-white ${
            value === option.value ? "bg-white text-navy shadow-sm" : "text-white/75 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
