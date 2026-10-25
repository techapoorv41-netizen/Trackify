import {
  AlertTriangle, ArrowDown, ArrowUp, CalendarClock, CheckCircle2, Clock, Eye, FileWarning, Hourglass, Inbox,
  Minus, PauseCircle, Pencil, Send, ShieldAlert, ShieldCheck, ShieldX, XCircle, AlarmClock,
} from 'lucide-react';

const TONES = {
  neutral: 'bg-soft text-muted border-line',
  info: 'bg-accent-50 text-accent border-accent/25',
  warning: 'bg-warning-50 text-warning border-warning/30',
  success: 'bg-success-50 text-success border-success/30',
  danger: 'bg-danger-50 text-danger border-danger/30',
};

const META = {
  // application statuses
  Draft: { tone: 'neutral', icon: Pencil, tip: 'Saved but not yet submitted.' },
  Submitted: { tone: 'info', icon: Send, tip: 'Submitted and waiting to be picked up.' },
  'Validation Pending': { tone: 'info', icon: Hourglass, tip: 'Queued for automated demo validation.' },
  'Under Review': { tone: 'info', icon: Eye, tip: 'An officer is scrutinising the application.' },
  'Documents Required': { tone: 'warning', icon: FileWarning, tip: 'The institute must respond to a document request.' },
  Approved: { tone: 'success', icon: CheckCircle2, tip: 'Approved in demo mode (simulated outcome).' },
  Rejected: { tone: 'danger', icon: XCircle, tip: 'Rejected in demo mode (simulated outcome).' },
  // validation
  'File Received': { tone: 'neutral', icon: Inbox, tip: 'File received. No verification has been performed.' },
  'Completeness Check Passed': { tone: 'success', icon: CheckCircle2, tip: 'Demo completeness check passed. Not an official verification.' },
  'Missing Information': { tone: 'warning', icon: AlertTriangle, tip: 'Information is missing from this document.' },
  'Review Required': { tone: 'info', icon: Eye, tip: 'Needs manual officer review.' },
  // compliance
  Compliant: { tone: 'success', icon: ShieldCheck, tip: 'Meets the demonstration rule.' },
  'Partially Compliant': { tone: 'warning', icon: ShieldAlert, tip: 'Partly meets the demonstration rule.' },
  'Non-Compliant': { tone: 'danger', icon: ShieldX, tip: 'Does not meet the demonstration rule.' },
  'Evidence Pending': { tone: 'neutral', icon: Clock, tip: 'Evidence has not yet been reviewed.' },
  // priority / severity
  High: { tone: 'danger', icon: ArrowUp, tip: 'High (demo priority, not an official assessment).' },
  Medium: { tone: 'warning', icon: Minus, tip: 'Medium (demo priority, not an official assessment).' },
  Low: { tone: 'neutral', icon: ArrowDown, tip: 'Low (demo priority, not an official assessment).' },
  // delivery, users, reminders, rules
  Scheduled: { tone: 'info', icon: CalendarClock, tip: 'Scheduled in the local demo scheduler.' },
  'Sent in-app (simulated)': { tone: 'success', icon: Send, tip: 'Delivered as an in-app demo notification only.' },
  Active: { tone: 'success', icon: CheckCircle2 },
  Inactive: { tone: 'neutral', icon: PauseCircle },
  Paused: { tone: 'neutral', icon: PauseCircle },
  Enabled: { tone: 'success', icon: CheckCircle2 },
  Disabled: { tone: 'neutral', icon: PauseCircle },
  Overdue: { tone: 'danger', icon: AlarmClock },
  'Due Soon': { tone: 'warning', icon: Clock },
  Upcoming: { tone: 'info', icon: CalendarClock },
  Done: { tone: 'success', icon: CheckCircle2 },
  New: { tone: 'info', icon: Inbox },
  'In Progress': { tone: 'info', icon: Eye },
  'Awaiting Institute': { tone: 'warning', icon: Hourglass },
  Closed: { tone: 'neutral', icon: CheckCircle2 },
};

export default function StatusBadge({ status, label, size = 'md', showIcon = true, title }) {
  const meta = META[status] || { tone: 'neutral', icon: Clock };
  const Icon = meta.icon;
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      title={title || meta.tip}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border font-semibold ${pad} ${TONES[meta.tone]}`}
    >
      {showIcon && <Icon size={size === 'sm' ? 11 : 13} aria-hidden="true" />}
      {label || status}
    </span>
  );
}
