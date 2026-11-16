interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** On/off switch with its label, styled for dark (navy) panels. */
export function ToggleSwitch({ label, checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group inline-flex items-center gap-2.5 rounded-lg text-sm font-medium text-white/85 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
    >
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-white" : "bg-white/20 group-hover:bg-white/30"
        }`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-1 size-4 rounded-full shadow transition-all duration-200 ${
            checked ? "left-6 bg-navy" : "left-1 bg-white"
          }`}
        />
      </span>
      {label}
    </button>
  );
}
