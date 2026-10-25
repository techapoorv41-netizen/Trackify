export default function DateRangeFilter({ from, to, onChange, label = 'Date range' }) {
  return (
    <fieldset className="flex items-center gap-2">
      <legend className="sr-only">{label}</legend>
      <input type="date" aria-label={`${label}: from`} value={from} max={to || undefined} onChange={(e) => onChange({ from: e.target.value, to })} className="input w-auto" />
      <span className="text-xs text-muted" aria-hidden="true">to</span>
      <input type="date" aria-label={`${label}: to`} value={to} min={from || undefined} onChange={(e) => onChange({ from, to: e.target.value })} className="input w-auto" />
    </fieldset>
  );
}
