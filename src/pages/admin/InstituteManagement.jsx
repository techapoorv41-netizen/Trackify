import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, FilterX, Pencil, Plus } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import FilterDropdown from '@/components/common/FilterDropdown';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import Drawer from '@/components/common/Drawer';
import ProgressBar from '@/components/common/ProgressBar';
import { SelectField, TextField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { instituteRecordSchema } from '@/utils/schemas';
import { INDIAN_STATES, INSTITUTION_TYPES } from '@/utils/constants';
import { complianceScore, overallStatus } from '@/utils/compliance';
import { Link } from 'react-router-dom';

export default function InstituteManagement() {
  const { institutes, applications, allCompliance, actions } = useScopedData();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [state, setState] = useState('');
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  useEffect(() => {
    const open = params.get('open');
    if (open) { setViewing(open); setParams({}, { replace: true }); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const enriched = useMemo(() => institutes.map((i) => {
    const recs = allCompliance.filter((r) => r.instituteId === i.id);
    return { ...i, appCount: applications.filter((a) => a.instituteId === i.id).length, score: complianceScore(recs), compliance: overallStatus(recs) };
  }), [institutes, applications, allCompliance]);

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return enriched.filter((i) => (!s || [i.name, i.id, i.city].some((v) => v.toLowerCase().includes(s))) && (!type || i.type === type) && (!state || i.state === state));
  }, [enriched, q, type, state]);

  const form = useForm({ resolver: zodResolver(instituteRecordSchema), defaultValues: { name: '', type: '', state: '', city: '', email: '', phone: '' } });
  const openForm = (i) => { setEditing(i || 'new'); form.reset(i ? { name: i.name, type: i.type, state: i.state, city: i.city, email: i.email, phone: i.phone } : { name: '', type: '', state: '', city: '', email: '', phone: '' }); };
  const submit = form.handleSubmit((v) => {
    if (editing === 'new') { const inst = actions.addInstitute(v); toast.success('Demo institute added', `${inst.id} · ${inst.name}`); }
    else { actions.updateInstitute(editing.id, v); toast.success('Demo institute updated', v.name); }
    setEditing(null);
  });
  const clear = () => { setQ(''); setType(''); setState(''); };
  const viewed = enriched.find((i) => i.id === viewing);
  const viewedApps = applications.filter((a) => a.instituteId === viewing);

  const columns = [
    { key: 'name', header: 'Institute', sortable: true, render: (i) => <span><span className="block max-w-[16rem] truncate font-medium">{i.name}</span><span className="text-xs text-muted">{i.id}</span></span> },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'city', header: 'Location', sortable: true, render: (i) => `${i.city}, ${i.state}` },
    { key: 'appCount', header: 'Applications', sortable: true },
    { key: 'compliance', header: 'Compliance', sortable: true, render: (i) => <span className="flex items-center gap-2"><StatusBadge status={i.compliance} size="sm" /><span className="text-xs text-muted">{i.score}%</span></span> },
    { key: 'actions', header: 'Actions', render: (i) => <div className="flex gap-1.5"><button type="button" className="btn btn-secondary btn-sm" aria-label={`View ${i.name}`} onClick={() => setViewing(i.id)}><Eye size={13} /></button><button type="button" className="btn btn-secondary btn-sm" aria-label={`Edit ${i.name}`} onClick={() => openForm(i)}><Pencil size={13} /></button></div> },
  ];

  return (
    <>
      <PageHeader title="Institute Management" description="Directory of fictional demo institutes." actions={<button type="button" className="btn btn-primary" onClick={() => openForm()}><Plus size={16} /> Add demo institute</button>} />
      <div className="card">
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search name, ID, city…" label="Search institutes" />
          <FilterDropdown label="Type" value={type} onChange={setType} options={INSTITUTION_TYPES} />
          <FilterDropdown label="State" value={state} onChange={setState} options={[...new Set(institutes.map((i) => i.state))].sort()} />
          <button type="button" className="btn btn-ghost" disabled={!(q || type || state)} onClick={clear}><FilterX size={14} /> Clear filters</button>
        </div>
        <DataTable columns={columns} rows={rows} caption="Institutes" initialSort={{ key: 'name', dir: 'asc' }} empty={<EmptyState icon={Building2} title="No institutes match" action={<button type="button" className="btn btn-secondary btn-sm" onClick={clear}>Clear filters</button>} />} />
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add demo institute' : 'Edit demo institute'} size="lg"
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}>{editing === 'new' ? 'Add institute' : 'Save changes'}</button></>}>
        <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2"><TextField label="Institute name" required error={form.formState.errors.name?.message} {...form.register('name')} /></div>
          <SelectField label="Type" required options={INSTITUTION_TYPES} error={form.formState.errors.type?.message} {...form.register('type')} />
          <SelectField label="State" required options={INDIAN_STATES} error={form.formState.errors.state?.message} {...form.register('state')} />
          <TextField label="City" required error={form.formState.errors.city?.message} {...form.register('city')} />
          <TextField label="Email" type="email" required error={form.formState.errors.email?.message} {...form.register('email')} />
          <TextField label="Phone" type="tel" required error={form.formState.errors.phone?.message} {...form.register('phone')} />
          <button type="submit" className="sr-only">Submit</button>
        </form>
      </Modal>

      <Drawer open={Boolean(viewed)} onClose={() => setViewing(null)} title={viewed?.name || ''} subtitle={viewed && `${viewed.id} · ${viewed.type}`}>
        {viewed && (
          <div className="space-y-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[['Location', `${viewed.city}, ${viewed.state}`], ['Email', viewed.email], ['Phone', viewed.phone], ['Applications', viewed.appCount]].map(([k, v]) => <div key={k}><dt className="text-xs font-semibold text-muted">{k}</dt><dd className="mt-0.5 break-words text-ink">{v}</dd></div>)}
            </dl>
            <div><ProgressBar label="Compliance (demo rules)" value={viewed.score} /><div className="mt-2"><StatusBadge status={viewed.compliance} size="sm" /></div></div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Associated applications</h3>
              {viewedApps.length ? (
                <ul className="mt-2 divide-y divide-line">
                  {viewedApps.map((a) => <li key={a.id} className="flex items-center justify-between gap-3 py-2.5"><span><Link to={`/officer/applications/${a.id}`} className="text-sm font-semibold text-accent hover:underline">{a.id}</Link><span className="block text-xs text-muted">{a.applicationType}</span></span><StatusBadge status={a.status} size="sm" /></li>)}
                </ul>
              ) : <p className="mt-2 text-sm text-muted">No applications yet.</p>}
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
}
