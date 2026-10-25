import { Link } from 'react-router-dom';
import { AlertCircle, Eye, FilePen, Upload } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate, relativeTime } from '@/utils/format';

export function pendingActionFor(app) {
  switch (app.status) {
    case 'Draft': return 'Complete and submit the application';
    case 'Submitted': return 'Waiting for validation';
    case 'Validation Pending': return 'Automated validation in progress';
    case 'Under Review': return 'Officer review in progress';
    case 'Documents Required': return 'Upload the requested documents';
    case 'Approved': return 'None. Demo approval recorded';
    case 'Rejected': return 'Review the rejection reason';
    default: return '—';
  }
}

export default function ApplicationsTable({ applications, pageSize, empty, compact = false }) {
  const columns = [
    {
      key: 'id', header: 'Application ID', sortable: true,
      render: (a) => (
        <Link to={a.status === 'Draft' ? `/institute/applications/new?draft=${a.id}` : `/institute/applications/${a.id}`} className="font-semibold text-accent hover:underline">{a.id}</Link>
      ),
    },
    { key: 'applicationType', header: 'Application Type', sortable: true, render: (a) => <span><span className="block">{a.applicationType}</span>{!compact && <span className="text-xs text-muted">{a.academicYear}</span>}</span> },
    { key: 'submittedAt', header: 'Submission Date', sortable: true, sortValue: (a) => (a.submittedAt ? new Date(a.submittedAt).getTime() : 0), render: (a) => (a.submittedAt ? formatDate(a.submittedAt) : <span className="text-muted">Not submitted</span>) },
    { key: 'status', header: 'Current Status', sortable: true, render: (a) => <StatusBadge status={a.status} /> },
    { key: 'pending', header: 'Pending Action', render: (a) => <span className="text-sm text-muted">{pendingActionFor(a)}</span> },
    { key: 'updatedAt', header: 'Last Updated', sortable: true, sortValue: (a) => new Date(a.updatedAt).getTime(), render: (a) => <span className="whitespace-nowrap text-muted">{relativeTime(a.updatedAt)}</span> },
    {
      key: 'actions', header: 'Actions',
      render: (a) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {a.status === 'Draft' ? (
            <Link to={`/institute/applications/new?draft=${a.id}`} className="btn btn-secondary btn-sm"><FilePen size={13} /> Continue draft</Link>
          ) : (
            <Link to={`/institute/applications/${a.id}`} className="btn btn-secondary btn-sm"><Eye size={13} /> View details</Link>
          )}
          {a.status === 'Documents Required' && (
            <>
              <Link to={`/institute/applications/${a.id}#respond`} className="btn btn-primary btn-sm"><Upload size={13} /> Upload missing</Link>
              <Link to={`/institute/applications/${a.id}#feedback`} className="btn btn-ghost btn-sm"><AlertCircle size={13} /> Feedback</Link>
            </>
          )}
        </div>
      ),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={applications}
      pageSize={pageSize}
      initialSort={{ key: 'updatedAt', dir: 'desc' }}
      empty={empty}
      caption="Applications"
    />
  );
}
