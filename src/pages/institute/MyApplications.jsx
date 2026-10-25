import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, FileText, FilterX } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import FilterDropdown from '@/components/common/FilterDropdown';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import EmptyState from '@/components/common/EmptyState';
import ApplicationsTable from '@/components/applications/ApplicationsTable';
import { useScopedData } from '@/hooks/useScopedData';
import { ACADEMIC_YEARS, APPLICATION_CATEGORIES, STATUSES } from '@/utils/constants';
import { inRange } from '@/utils/format';

const EMPTY = { q: '', status: '', category: '', year: '', from: '', to: '' };

export default function MyApplications() {
  const { scoped } = useScopedData();
  const [f, setF] = useState(EMPTY);
  const set = (patch) => setF((s) => ({ ...s, ...patch }));
  const filtered = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return scoped.applications.filter((a) => {
      if (q && ![a.id, a.applicationType, a.status, a.programDetails].some((v) => String(v).toLowerCase().includes(q))) return false;
      if (f.status && a.status !== f.status) return false;
      if (f.category && a.applicationType !== f.category) return false;
      if (f.year && a.academicYear !== f.year) return false;
      if ((f.from || f.to) && (!a.submittedAt || !inRange(a.submittedAt, f.from, f.to))) return false;
      return true;
    });
  }, [scoped.applications, f]);
  const dirty = JSON.stringify(f) !== JSON.stringify(EMPTY);

  return (
    <>
      <PageHeader
        title="My Applications"
        description="Search, filter and track every application submitted by your institute."
        actions={<Link to="/institute/applications/new" className="btn btn-primary"><FilePlus2 size={16} /> New Application</Link>}
      />
      <div className="card">
        <div className="space-y-3 border-b border-line p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SearchInput value={f.q} onChange={(q) => set({ q })} placeholder="Search by ID, type, status…" label="Search applications" />
            <FilterDropdown label="Status" value={f.status} onChange={(status) => set({ status })} options={STATUSES} />
            <FilterDropdown label="Category" value={f.category} onChange={(category) => set({ category })} options={APPLICATION_CATEGORIES} />
            <FilterDropdown label="Academic year" value={f.year} onChange={(year) => set({ year })} options={ACADEMIC_YEARS} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted">Submitted between</span>
              <DateRangeFilter from={f.from} to={f.to} onChange={({ from, to }) => set({ from, to })} label="Submission date" />
            </div>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!dirty} onClick={() => setF(EMPTY)}><FilterX size={14} /> Clear filters</button>
          </div>
        </div>
        <ApplicationsTable
          applications={filtered}
          empty={
            scoped.applications.length ? (
              <EmptyState icon={FilterX} title="No applications match your filters" description="Try a different search term or clear the filters." action={<button type="button" className="btn btn-secondary btn-sm" onClick={() => setF(EMPTY)}>Clear filters</button>} />
            ) : (
              <EmptyState icon={FileText} title="No applications yet" description="Start your first application with the guided wizard." action={<Link to="/institute/applications/new" className="btn btn-primary btn-sm">Create application</Link>} />
            )
          }
        />
      </div>
    </>
  );
}
