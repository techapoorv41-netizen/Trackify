import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, FilterX, Info } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import FilterDropdown from '@/components/common/FilterDropdown';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import { useScopedData } from '@/hooks/useScopedData';
import { APPLICATION_CATEGORIES, PRIORITIES, PRIORITY_ORDER, STATUSES } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import { queueState } from '@/services/applicationService';

const VALIDATION_PRIORITY = ['Review Required', 'Missing Information', 'File Received', 'Completeness Check Passed'];

export default function ReviewQueue() {
  const { scoped, instituteById, documents, workflow } = useScopedData();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return scoped.applications.filter((a) => a.status !== 'Draft').map((a) => {
      const docs = documents.filter((d) => d.applicationId === a.id);
      const validation = VALIDATION_PRIORITY.find((v) => docs.some((d) => d.validationStatus === v)) || 'File Received';
      return { ...a, institute: instituteById[a.instituteId]?.name || a.instituteId, validation, queue: queueState(a, workflow) };
    }).filter((a) => {
      if (s && ![a.id, a.institute, a.applicationType].some((v) => v.toLowerCase().includes(s))) return false;
      if (status && a.status !== status) return false;
      if (priority && a.priority !== priority) return false;
      if (category && a.applicationType !== category) return false;
      if (state && a.queue !== state) return false;
      return true;
    });
  }, [scoped.applications, documents, instituteById, workflow, q, status, priority, category, state]);

  const clear = () => { setQ(''); setStatus(''); setPriority(''); setCategory(''); setState(''); };
  const dirty = q || status || priority || category || state;

  const columns = [
    { key: 'id', header: 'Application ID', sortable: true, render: (a) => <Link to={`/officer/applications/${a.id}`} className="font-semibold text-accent hover:underline">{a.id}</Link> },
    { key: 'institute', header: 'Institute', sortable: true, render: (a) => <span className="block max-w-[15rem] truncate">{a.institute}</span> },
    { key: 'applicationType', header: 'Category', sortable: true },
    { key: 'submittedAt', header: 'Submitted', sortable: true, sortValue: (a) => new Date(a.submittedAt).getTime(), render: (a) => formatDate(a.submittedAt) },
    { key: 'validation', header: 'Validation', render: (a) => <StatusBadge status={a.validation} size="sm" /> },
    { key: 'priority', header: 'Priority', sortable: true, sortValue: (a) => PRIORITY_ORDER[a.priority], render: (a) => <StatusBadge status={a.priority} size="sm" /> },
    { key: 'queue', header: 'Queue state', sortable: true, render: (a) => <StatusBadge status={a.queue} size="sm" /> },
    { key: 'status', header: 'Current status', sortable: true, render: (a) => <StatusBadge status={a.status} size="sm" /> },
    { key: 'review', header: 'Review action', render: (a) => <Link to={`/officer/applications/${a.id}`} className="btn btn-primary btn-sm">{['Approved', 'Rejected'].includes(a.status) ? 'View' : 'Review'}</Link> },
  ];

  return (
    <>
      <PageHeader title="Review Queue" description="Applications awaiting scrutiny. New, in-progress and overdue states are demo classifications based on a configurable review window." />
      <div className="mb-5 flex gap-3 rounded-lg border border-accent/25 bg-accent-50 p-3.5 text-xs text-ink">
        <Info size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        <p>Priority values are demo labels and are not official regulatory assessments.</p>
      </div>
      <div className="card">
        <div className="space-y-3 border-b border-line p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <SearchInput value={q} onChange={setQ} placeholder="Search ID, institute…" label="Search review queue" className="xl:col-span-1" />
            <FilterDropdown label="Status" value={status} onChange={setStatus} options={STATUSES.filter((s) => s !== 'Draft')} />
            <FilterDropdown label="Priority" value={priority} onChange={setPriority} options={PRIORITIES} />
            <FilterDropdown label="Category" value={category} onChange={setCategory} options={APPLICATION_CATEGORIES} />
            <FilterDropdown label="Queue state" value={state} onChange={setState} options={['New', 'In Progress', 'Overdue', 'Awaiting Institute', 'Closed']} />
          </div>
          <div className="flex justify-end"><button type="button" className="btn btn-ghost btn-sm" disabled={!dirty} onClick={clear}><FilterX size={14} /> Clear filters</button></div>
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          initialSort={{ key: 'priority', dir: 'asc' }}
          caption="Review queue"
          rowClassName={(a) => (a.queue === 'Overdue' ? 'bg-danger-50/40' : a.queue === 'New' ? 'bg-accent-50/30' : '')}
          empty={<EmptyState icon={dirty ? FilterX : ClipboardList} title={dirty ? 'No applications match your filters' : 'The queue is empty'} description={dirty ? 'Try broadening your search.' : 'Submitted applications will appear here.'} action={dirty && <button type="button" className="btn btn-secondary btn-sm" onClick={clear}>Clear filters</button>} />}
        />
      </div>
    </>
  );
}
