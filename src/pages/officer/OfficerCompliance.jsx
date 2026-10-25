import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, FileQuestion, FilterX, ShieldAlert, Building2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import MetricCard from '@/components/common/MetricCard';
import ChartCard from '@/components/common/ChartCard';
import FilterDropdown from '@/components/common/FilterDropdown';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import Drawer from '@/components/common/Drawer';
import EmptyState from '@/components/common/EmptyState';
import Panel from '@/components/dashboard/Panel';
import { SelectField, TextAreaField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { COMPLIANCE_CATEGORIES, COMPLIANCE_STATUSES } from '@/utils/constants';
import { COMPLIANCE_COLORS } from '@/components/charts/chartTheme';
import { formatDate, relativeTime } from '@/utils/format';
import { isOpenIssue } from '@/utils/compliance';

export default function OfficerCompliance() {
  const { scoped, instituteById, actions } = useScopedData();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [institute, setInstitute] = useState(params.get('institute') || '');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [year, setYear] = useState('');
  const [openId, setOpenId] = useState(null);
  const [nextStatus, setNextStatus] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => { if (params.get('institute')) { setInstitute(params.get('institute')); setParams({}, { replace: true }); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const all = scoped.compliance;
  const rows = useMemo(() => all.filter((r) =>
    (!institute || r.instituteId === institute) && (!category || r.category === category) && (!status || r.status === status) && (!year || r.academicYear === year),
  ).map((r) => ({ ...r, instituteName: instituteById[r.instituteId]?.name || r.instituteId })), [all, institute, category, status, year, instituteById]);

  const dist = COMPLIANCE_STATUSES.map((s) => ({ name: s, value: rows.filter((r) => r.status === s).length })).filter((d) => d.value);
  const attention = useMemo(() => {
    const map = {};
    rows.filter(isOpenIssue).forEach((r) => { map[r.instituteId] = (map[r.instituteId] || 0) + (r.status === 'Non-Compliant' ? 2 : 1); });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, n]) => ({ id, n, name: instituteById[id]?.name }));
  }, [rows, instituteById]);
  const missingDocs = rows.filter((r) => !r.evidence && r.status !== 'Compliant');
  const open = rows.filter(isOpenIssue);
  const recent = [...rows].sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)).slice(0, 5);
  const selected = all.find((r) => r.id === openId);
  const dirty = institute || category || status || year;
  const clear = () => { setInstitute(''); setCategory(''); setStatus(''); setYear(''); };

  const openRecord = (r) => { setOpenId(r.id); setNextStatus(r.status); setNote(r.note || ''); };
  const save = () => {
    actions.updateComplianceStatus(selected.id, nextStatus, note.trim());
    toast.success('Compliance record updated', `${selected.requirement}: ${nextStatus} (demo).`);
    setOpenId(null);
  };

  const columns = [
    { key: 'instituteName', header: 'Institute', sortable: true, render: (r) => <span className="block max-w-[14rem] truncate">{r.instituteName}</span> },
    { key: 'category', header: 'Category', sortable: true },
    { key: 'requirement', header: 'Requirement', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} size="sm" /> },
    { key: 'severity', header: 'Severity', render: (r) => <StatusBadge status={r.severity} size="sm" /> },
    { key: 'academicYear', header: 'Year', sortable: true },
    { key: 'lastUpdated', header: 'Updated', sortable: true, sortValue: (r) => new Date(r.lastUpdated).getTime(), render: (r) => formatDate(r.lastUpdated) },
    { key: 'view', header: 'Details', render: (r) => <button type="button" className="btn btn-secondary btn-sm" onClick={() => openRecord(r)}>Open</button> },
  ];

  return (
    <>
      <PageHeader title="Compliance Monitoring" description="Institution-wide view against configurable demonstration rules. Not current AICTE regulations." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Records in view" value={rows.length} description="After filters" icon={Building2} />
        <MetricCard label="Institutions needing attention" value={attention.length} description="With open demo issues" icon={AlertTriangle} tone="amber" />
        <MetricCard label="Missing documentation" value={missingDocs.length} description="No evidence reference" icon={FileQuestion} tone="red" />
        <MetricCard label="Open deficiencies" value={open.length} description="Partial or non-compliant" icon={ShieldAlert} tone="amber" />
      </div>

      <div className="card mt-6 grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-5">
        <FilterDropdown label="Institution" value={institute} onChange={setInstitute} options={Object.values(instituteById).map((i) => ({ value: i.id, label: i.name }))} />
        <FilterDropdown label="Category" value={category} onChange={setCategory} options={COMPLIANCE_CATEGORIES} />
        <FilterDropdown label="Status" value={status} onChange={setStatus} options={COMPLIANCE_STATUSES} />
        <FilterDropdown label="Academic year" value={year} onChange={setYear} options={['2025-26', '2026-27']} />
        <button type="button" className="btn btn-ghost" disabled={!dirty} onClick={clear}><FilterX size={14} /> Clear filters</button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ChartCard title="Compliance status distribution" height={260}>
          {dist.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dist} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
                  {dist.map((d) => <Cell key={d.name} fill={COMPLIANCE_COLORS[d.name]} stroke="none" />)}
                </Pie>
                <Tooltip /><Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="py-10 text-center text-sm text-muted">No records match the filters.</p>}
        </ChartCard>
        <Panel title="Institutions requiring attention" subtitle="Weighted by open issues">
          {attention.length ? (
            <ul className="space-y-3">
              {attention.map((a) => (
                <li key={a.id}><button type="button" onClick={() => setInstitute(a.id)} className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-soft"><span className="min-w-0"><span className="block truncate text-sm font-medium text-ink">{a.name}</span><span className="text-xs text-muted">{a.id}</span></span><span className="rounded-full bg-warning-50 px-2 py-0.5 text-xs font-bold text-warning">{a.n}</span></button></li>
              ))}
            </ul>
          ) : <EmptyState compact title="Nothing needs attention" />}
        </Panel>
        <Panel title="Recent compliance updates">
          {recent.length ? (
            <ul className="space-y-3">
              {recent.map((r) => <li key={r.id} className="text-sm"><p className="truncate font-medium text-ink">{r.requirement}</p><p className="text-xs text-muted">{r.instituteName} · {relativeTime(r.lastUpdated)}</p></li>)}
            </ul>
          ) : <EmptyState compact title="No updates" />}
        </Panel>
      </div>

      <div className="card mt-6">
        <DataTable columns={columns} rows={rows} initialSort={{ key: 'lastUpdated', dir: 'desc' }} caption="Compliance records"
          empty={<EmptyState icon={FilterX} title="No compliance records match" description="Adjust or clear the filters." action={<button type="button" className="btn btn-secondary btn-sm" onClick={clear}>Clear filters</button>} />} />
      </div>

      <Drawer open={Boolean(selected)} onClose={() => setOpenId(null)} title={selected?.requirement || ''} subtitle={selected && instituteById[selected.instituteId]?.name}
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setOpenId(null)}>Cancel</button><button type="button" className="btn btn-primary" onClick={save}>Save update</button></>}>
        {selected && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2"><StatusBadge status={selected.status} /><StatusBadge status={selected.severity} /><span className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-muted">{selected.category}</span></div>
            <p className="text-sm text-ink">{selected.description}</p>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-xs font-semibold text-muted">Academic year</dt><dd>{selected.academicYear}</dd></div>
              <div><dt className="text-xs font-semibold text-muted">Last updated</dt><dd>{formatDate(selected.lastUpdated)}</dd></div>
              <div className="col-span-2"><dt className="text-xs font-semibold text-muted">Evidence</dt><dd>{selected.evidence || 'None attached'}</dd></div>
              <div className="col-span-2"><dt className="text-xs font-semibold text-muted">Recommended next action</dt><dd>{selected.nextAction}</dd></div>
            </dl>
            <SelectField label="Update status (demo)" options={COMPLIANCE_STATUSES} value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} />
            <TextAreaField label="Note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} hint="Saved locally and written to the demo audit log." />
          </div>
        )}
      </Drawer>
    </>
  );
}
