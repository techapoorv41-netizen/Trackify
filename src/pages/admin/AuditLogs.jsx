import { useMemo, useState } from 'react';
import { Download, FilterX, Info, ScrollText } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import FilterDropdown from '@/components/common/FilterDropdown';
import DateRangeFilter from '@/components/common/DateRangeFilter';
import DataTable from '@/components/common/DataTable';
import EmptyState from '@/components/common/EmptyState';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { ROLES } from '@/utils/constants';
import { formatDateTime, inRange } from '@/utils/format';
import { downloadCSV, toCSV } from '@/utils/csv';

export default function AuditLogs() {
  const { audit } = useScopedData();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [actor, setActor] = useState('');
  const [role, setRole] = useState('');
  const [action, setAction] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });

  const actors = useMemo(() => [...new Set(audit.map((e) => e.actor))].sort(), [audit]);
  const actionsList = useMemo(() => [...new Set(audit.map((e) => e.action))].sort(), [audit]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return audit.filter((e) => (!s || [e.description, e.entityId, e.entityType, e.action].some((v) => String(v).toLowerCase().includes(s)))
      && (!actor || e.actor === actor) && (!role || e.role === role) && (!action || e.action === action)
      && (!(range.from || range.to) || inRange(e.timestamp, range.from, range.to)));
  }, [audit, q, actor, role, action, range]);

  const dirty = q || actor || role || action || range.from || range.to;
  const clear = () => { setQ(''); setActor(''); setRole(''); setAction(''); setRange({ from: '', to: '' }); };
  const exportCsv = () => {
    downloadCSV('trackify-demo-audit-log.csv', toCSV(rows, [
      { header: 'Timestamp', value: (e) => e.timestamp }, { header: 'Actor', value: (e) => e.actor }, { header: 'Role', value: (e) => e.role },
      { header: 'Action', value: (e) => e.action }, { header: 'Entity type', value: (e) => e.entityType }, { header: 'Entity ID', value: (e) => e.entityId }, { header: 'Description', value: (e) => e.description },
    ]));
    toast.success('CSV downloaded', `${rows.length} demo audit event(s) exported.`);
  };

  const columns = [
    { key: 'timestamp', header: 'Timestamp', sortable: true, sortValue: (e) => new Date(e.timestamp).getTime(), render: (e) => <span className="whitespace-nowrap">{formatDateTime(e.timestamp)}</span> },
    { key: 'actor', header: 'Actor', sortable: true },
    { key: 'role', header: 'Role', sortable: true, render: (e) => ROLES[e.role]?.label || 'System' },
    { key: 'action', header: 'Action', sortable: true, render: (e) => <span className="font-medium">{e.action}</span> },
    { key: 'entityType', header: 'Entity', sortable: true },
    { key: 'entityId', header: 'Entity ID', sortable: true },
    { key: 'description', header: 'Description', render: (e) => <span className="block min-w-[14rem] text-muted">{e.description}</span> },
  ];

  return (
    <>
      <PageHeader title="Audit Logs" description="History of simulated actions in this prototype." actions={<button type="button" className="btn btn-secondary" onClick={exportCsv} disabled={!rows.length}><Download size={16} /> Export CSV</button>} />
      <div className="mb-5 flex gap-3 rounded-lg border border-warning/30 bg-warning-50 p-3.5 text-xs text-ink">
        <Info size={16} className="mt-0.5 shrink-0 text-warning" aria-hidden="true" />
        <p>These are demo audit events stored in your browser. They are not tamper-proof and do not provide production-grade security or auditing.</p>
      </div>
      <div className="card">
        <div className="space-y-3 border-b border-line p-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SearchInput value={q} onChange={setQ} placeholder="Search description, entity…" label="Search audit log" />
            <FilterDropdown label="Actor" value={actor} onChange={setActor} options={actors} />
            <FilterDropdown label="Role" value={role} onChange={setRole} options={[...Object.keys(ROLES).map((r) => ({ value: r, label: ROLES[r].label })), { value: 'system', label: 'System' }]} />
            <FilterDropdown label="Action" value={action} onChange={setAction} options={actionsList} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-muted">Date</span><DateRangeFilter from={range.from} to={range.to} onChange={setRange} label="Audit date" /></div>
            <button type="button" className="btn btn-ghost btn-sm" disabled={!dirty} onClick={clear}><FilterX size={14} /> Clear filters</button>
          </div>
        </div>
        <DataTable columns={columns} rows={rows} pageSize={10} caption="Audit events" initialSort={{ key: 'timestamp', dir: 'desc' }} empty={<EmptyState icon={ScrollText} title="No audit events match" description="Adjust or clear the filters." action={dirty && <button type="button" className="btn btn-secondary btn-sm" onClick={clear}>Clear filters</button>} />} />
      </div>
    </>
  );
}
