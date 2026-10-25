import { FileText } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/format';

export default function ComplianceCard({ record, actions, onClick }) {
  const Wrapper = onClick ? 'button' : 'div';
  return (
    <Wrapper
      {...(onClick ? { type: 'button', onClick } : {})}
      className={`card flex w-full flex-col gap-3 p-4 text-left ${onClick ? 'transition-shadow hover:shadow-pop' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-ink">{record.requirement}</h3>
          <p className="mt-0.5 text-xs text-muted">{record.category} · Configurable demo rule</p>
        </div>
        <StatusBadge status={record.status} size="sm" />
      </div>
      <p className="text-sm text-muted">{record.description}</p>
      <dl className="grid gap-x-4 gap-y-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-muted">Last updated</dt>
          <dd className="mt-0.5 text-ink">{formatDate(record.lastUpdated)}</dd>
        </div>
        <div>
          <dt className="font-semibold text-muted">Evidence</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 text-ink">
            {record.evidence ? (<><FileText size={12} className="shrink-0 text-muted" aria-hidden="true" /><span className="truncate">{record.evidence}</span></>) : <span className="text-muted">None attached</span>}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-semibold text-muted">Recommended next action</dt>
          <dd className="mt-0.5 text-ink">{record.nextAction}</dd>
        </div>
      </dl>
      {actions && <div className="flex flex-wrap gap-2 border-t border-line pt-3">{actions}</div>}
    </Wrapper>
  );
}
