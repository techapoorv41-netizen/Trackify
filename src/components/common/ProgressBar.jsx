export default function ProgressBar({ value, label, tone, showValue = true }) {
  const pct = Math.max(0, Math.min(100, value));
  const auto = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warning' : 'bg-danger';
  const color = tone || auto;
  return (
    <div>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-sm">
          {label && <span className="font-medium text-ink">{label}</span>}
          {showValue && <span className="font-semibold text-ink">{pct}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
