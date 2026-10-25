import { CalendarClock, FileText, FileWarning, Info, ShieldCheck, X, Circle } from 'lucide-react';
import { relativeTime } from '@/utils/format';

const ICONS = {
  'Application Update': FileText,
  'Document Deficiency': FileWarning,
  'Deadline Reminder': CalendarClock,
  Compliance: ShieldCheck,
  System: Info,
};
const TONES = {
  'Application Update': 'bg-accent-50 text-accent',
  'Document Deficiency': 'bg-warning-50 text-warning',
  'Deadline Reminder': 'bg-danger-50 text-danger',
  Compliance: 'bg-success-50 text-success',
  System: 'bg-soft text-muted',
};

export default function NotificationItem({ notification: n, onOpen, onDismiss, onToggleRead, showToggle = false }) {
  const Icon = ICONS[n.category] || Info;
  return (
    <div className={`group relative flex gap-3 px-4 py-3 transition-colors hover:bg-soft/60 ${n.isRead ? '' : 'bg-accent-50/40'}`}>
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TONES[n.category] || TONES.System}`}>
        <Icon size={16} aria-hidden="true" />
      </span>
      <button type="button" onClick={() => onOpen(n)} className="min-w-0 flex-1 rounded text-left">
        <span className="flex items-center gap-2">
          {!n.isRead && <Circle size={8} className="shrink-0 fill-accent text-accent" aria-label="Unread" />}
          <span className={`truncate text-sm ${n.isRead ? 'font-medium text-ink' : 'font-semibold text-ink'}`}>{n.title}</span>
        </span>
        <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted">{n.message}</span>
        <span className="mt-1 block text-[11px] text-muted">{n.category} · {relativeTime(n.createdAt)}</span>
      </button>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button type="button" onClick={() => onDismiss(n.id)} aria-label={`Dismiss notification: ${n.title}`} className="rounded p-1 text-muted hover:bg-line hover:text-ink">
          <X size={14} />
        </button>
        {showToggle && (
          <button type="button" onClick={() => onToggleRead(n)} className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-accent hover:bg-accent-50">
            {n.isRead ? 'Mark unread' : 'Mark read'}
          </button>
        )}
      </div>
    </div>
  );
}
