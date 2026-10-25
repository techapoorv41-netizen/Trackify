export default function Tabs({ tabs, value, onChange, label = 'Sections' }) {
  return (
    <div role="tablist" aria-label={label} className="scroll-thin flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => {
        const active = t.value === value;
        return (
          <button
            key={t.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={`-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              active ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
            {t.count != null && (
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] ${active ? 'bg-accent-50 text-accent' : 'bg-soft text-muted'}`}>{t.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
