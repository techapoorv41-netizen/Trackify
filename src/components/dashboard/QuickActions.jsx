import { Link } from 'react-router-dom';

export default function QuickActions({ actions }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
      {actions.map((a) => {
        const Icon = a.icon;
        const inner = (
          <>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent">
              <Icon size={17} aria-hidden="true" />
            </span>
            <span className="min-w-0 text-left">
              <span className="block text-sm font-semibold text-ink">{a.label}</span>
              {a.description && <span className="block truncate text-xs text-muted">{a.description}</span>}
            </span>
          </>
        );
        const cls = 'flex items-center gap-3 rounded-lg border border-line p-3 transition-colors hover:border-accent/50 hover:bg-soft';
        return a.to ? (
          <Link key={a.label} to={a.to} className={cls}>{inner}</Link>
        ) : (
          <button key={a.label} type="button" onClick={a.onClick} className={cls}>{inner}</button>
        );
      })}
    </div>
  );
}
