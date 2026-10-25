import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function Panel({ title, subtitle, linkTo, linkLabel = 'View all', actions, children, className = '', padded = true }) {
  return (
    <section className={`card flex flex-col ${className}`}>
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
        </div>
        {actions}
        {linkTo && (
          <Link to={linkTo} className="inline-flex shrink-0 items-center gap-1 rounded text-xs font-semibold text-accent hover:underline">
            {linkLabel} <ArrowRight size={13} aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className={`flex-1 ${padded ? 'px-5 pb-5' : ''}`}>{children}</div>
    </section>
  );
}
