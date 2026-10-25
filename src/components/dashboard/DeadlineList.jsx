import { Link } from 'react-router-dom';
import { CalendarCheck } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import { daysUntil, dueLabel, formatDate } from '@/utils/format';

export function deadlineState(d) {
  if (d.completed) return 'Done';
  const n = daysUntil(d.dueDate);
  if (n < 0) return 'Overdue';
  if (n <= 3) return 'Due Soon';
  return 'Upcoming';
}

export default function DeadlineList({ items, limit = 5, role }) {
  const open = items
    .filter((d) => !d.completed)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, limit);

  if (!open.length) {
    return <EmptyState compact icon={CalendarCheck} title="No upcoming deadlines" description="Tasks with due dates will appear here." />;
  }

  const link = (d) => {
    if (!d.applicationId) return null;
    return role === 'institute' ? `/institute/applications/${d.applicationId}` : `/officer/applications/${d.applicationId}`;
  };

  return (
    <ul className="divide-y divide-line">
      {open.map((d) => {
        const state = deadlineState(d);
        const to = link(d);
        const overdue = state === 'Overdue';
        return (
          <li key={d.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0">
              {to ? (
                <Link to={to} className="block truncate text-sm font-medium text-ink hover:text-accent">{d.title}</Link>
              ) : (
                <p className="truncate text-sm font-medium text-ink">{d.title}</p>
              )}
              <p className={`mt-0.5 text-xs ${overdue ? 'font-semibold text-danger' : 'text-muted'}`}>
                {formatDate(d.dueDate)} · {dueLabel(d.dueDate)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StatusBadge status={d.priority} size="sm" />
              {overdue && <StatusBadge status="Overdue" size="sm" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
