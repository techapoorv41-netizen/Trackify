import {
  CheckCircle2, ClipboardCheck, Eye, FilePlus2, FileText, FileWarning, MessageSquareReply, NotebookPen, Send,
  ShieldCheck, Trash2, XCircle, Cpu,
} from 'lucide-react';
import { formatDateTime } from '@/utils/format';

const EVENT_META = {
  created: { icon: FilePlus2, tone: 'bg-soft text-muted', label: 'Application Created' },
  submitted: { icon: Send, tone: 'bg-accent-50 text-accent', label: 'Submitted' },
  validation: { icon: Cpu, tone: 'bg-accent-50 text-accent', label: 'Automated Validation' },
  review_started: { icon: Eye, tone: 'bg-accent-50 text-accent', label: 'Officer Review' },
  document_reviewed: { icon: ShieldCheck, tone: 'bg-accent-50 text-accent', label: 'Document Reviewed' },
  document_added: { icon: FileText, tone: 'bg-soft text-muted', label: 'Document Added' },
  document_removed: { icon: Trash2, tone: 'bg-soft text-muted', label: 'Document Removed' },
  notes_saved: { icon: NotebookPen, tone: 'bg-soft text-muted', label: 'Review Notes' },
  clarification_requested: { icon: FileWarning, tone: 'bg-warning-50 text-warning', label: 'Clarification Requested' },
  clarification_response: { icon: MessageSquareReply, tone: 'bg-accent-50 text-accent', label: 'Clarification Submitted' },
  review_complete: { icon: ClipboardCheck, tone: 'bg-accent-50 text-accent', label: 'Review Complete' },
  approved: { icon: CheckCircle2, tone: 'bg-success-50 text-success', label: 'Final Decision: Approved (demo)' },
  rejected: { icon: XCircle, tone: 'bg-danger-50 text-danger', label: 'Final Decision: Rejected (demo)' },
};

export default function WorkflowTimeline({ events, newestFirst = false }) {
  const list = newestFirst ? [...events].reverse() : events;
  if (!list.length) return <p className="text-sm text-muted">No activity recorded yet.</p>;
  return (
    <ol className="relative space-y-5">
      {list.map((e, i) => {
        const meta = EVENT_META[e.type] || { icon: FileText, tone: 'bg-soft text-muted', label: e.type };
        const Icon = meta.icon;
        return (
          <li key={e.id} className="relative flex gap-3">
            {i < list.length - 1 && <span aria-hidden="true" className="absolute left-4 top-9 -bottom-5 w-px bg-line" />}
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${meta.tone}`}>
              <Icon size={15} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-semibold text-ink">{meta.label}</p>
              <p className="mt-0.5 text-sm text-muted">{e.text}</p>
              <p className="mt-1 text-xs text-muted">
                {e.actor} · {formatDateTime(e.at)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
