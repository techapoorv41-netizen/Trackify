import { ChevronDown } from 'lucide-react';

/** Accessible styled native select. options: array of strings or { value, label } */
export default function FilterDropdown({ label, value, onChange, options, allLabel = 'All', className = '', hideAll = false }) {
  const items = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input appearance-none pr-8" aria-label={label}>
        {!hideAll && <option value="">{`${label}: ${allLabel}`}</option>}
        {items.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
    </label>
  );
}
