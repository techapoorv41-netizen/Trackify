export default function ChartCard({ title, subtitle, actions, children, height = 260, footnote }) {
  return (
    <section className="card flex h-full flex-col p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {actions}
      </div>
      <div style={{ height }} className="w-full min-w-0">
        {children}
      </div>
      {footnote && <p className="mt-3 text-[11px] text-muted">{footnote}</p>}
    </section>
  );
}
