import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { CRUMB_LABELS } from '@/routes/navConfig';
import { ROLES } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const { session } = useAuth();
  const parts = pathname.split('/').filter(Boolean);
  const first = parts[0];
  const isRoleSegment = ROLES[first] && parts.length > 1;
  const rest = isRoleSegment ? parts.slice(1) : parts;
  const base = isRoleSegment ? `/${first}` : '';

  const crumbs = rest.map((seg, i) => ({
    label: CRUMB_LABELS[seg] || decodeURIComponent(seg),
    to: `${base}/${rest.slice(0, i + 1).join('/')}`,
  }));

  const homeLabel = ROLES[isRoleSegment ? first : session?.role]?.label || 'Home';
  const homeTo = ROLES[isRoleSegment ? first : session?.role]?.home || '/';

  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex items-center gap-1 text-sm">
        <li className="hidden shrink-0 sm:block">
          <Link to={homeTo} className="rounded font-medium text-muted hover:text-ink">{homeLabel}</Link>
        </li>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.to} className={`flex min-w-0 items-center gap-1 ${!last ? 'hidden sm:flex' : ''}`}>
              <ChevronRight size={14} className="hidden shrink-0 text-muted sm:block" aria-hidden="true" />
              {last ? (
                <span aria-current="page" className="truncate font-semibold text-ink">{c.label}</span>
              ) : (
                <Link to={c.to} className="truncate rounded font-medium text-muted hover:text-ink">{c.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
