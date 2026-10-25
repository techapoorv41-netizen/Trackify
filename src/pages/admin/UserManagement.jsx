import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, FilterX, Pencil, Power, UserPlus, Users } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import SearchInput from '@/components/common/SearchInput';
import FilterDropdown from '@/components/common/FilterDropdown';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import Drawer from '@/components/common/Drawer';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { SelectField, TextField } from '@/components/common/FormField';
import { useScopedData } from '@/hooks/useScopedData';
import { useToast } from '@/context/ToastContext';
import { userSchema } from '@/utils/schemas';
import { ROLES, ROLE_KEYS } from '@/utils/constants';
import { formatDate, initials } from '@/utils/format';

export default function UserManagement() {
  const { users, institutes, actions, user: me } = useScopedData();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | user
  const [viewing, setViewing] = useState(null);
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    const open = params.get('open');
    if (open) { setViewing(open); setParams({}, { replace: true }); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const instName = (id) => institutes.find((i) => i.id === id)?.name;
  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return users.filter((u) => (!s || [u.name, u.email, u.organization].some((v) => (v || '').toLowerCase().includes(s))) && (!role || u.role === role) && (!status || u.status === status));
  }, [users, q, role, status]);

  const form = useForm({ resolver: zodResolver(userSchema), defaultValues: { name: '', email: '', role: '', instituteId: '', organization: '' } });
  const watchedRole = form.watch('role');

  const openForm = (u) => {
    setEditing(u || 'new');
    form.reset(u ? { name: u.name, email: u.email, role: u.role, instituteId: u.instituteId || '', organization: u.organization || '' } : { name: '', email: '', role: '', instituteId: '', organization: '' });
  };

  const submit = form.handleSubmit((v) => {
    if (v.role === 'institute' && !v.instituteId) { form.setError('instituteId', { message: 'Select the associated institute' }); return; }
    const dup = users.find((u) => u.email.toLowerCase() === v.email.toLowerCase() && u.id !== editing?.id);
    if (dup) { form.setError('email', { message: 'A demo user with this email already exists' }); return; }
    const org = v.role === 'institute' ? instName(v.instituteId) : v.organization;
    if (editing === 'new') { actions.addUser({ ...v, organization: org }); toast.success('Demo user added', `${v.name} (${ROLES[v.role].label}). No real account was created.`); }
    else { actions.updateUser(editing.id, { ...v, organization: org }); toast.success('Demo user updated', v.name); }
    setEditing(null);
  });

  const clear = () => { setQ(''); setRole(''); setStatus(''); };
  const viewed = users.find((u) => u.id === viewing);

  const columns = [
    { key: 'name', header: 'Name', sortable: true, render: (u) => <div className="flex items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-[11px] font-bold text-white">{initials(u.name)}</span><span className="font-medium">{u.name}</span></div> },
    { key: 'email', header: 'Email', sortable: true, render: (u) => <span className="block max-w-[14rem] truncate text-muted">{u.email}</span> },
    { key: 'role', header: 'Role', sortable: true, render: (u) => ROLES[u.role].label },
    { key: 'organization', header: 'Institute / Organisation', render: (u) => <span className="block max-w-[14rem] truncate">{u.instituteId ? instName(u.instituteId) : u.organization || '—'}</span> },
    { key: 'status', header: 'Status', sortable: true, render: (u) => <StatusBadge status={u.status} size="sm" /> },
    { key: 'createdAt', header: 'Created', sortable: true, sortValue: (u) => new Date(u.createdAt).getTime(), render: (u) => formatDate(u.createdAt) },
    {
      key: 'actions', header: 'Actions',
      render: (u) => (
        <div className="flex gap-1.5">
          <button type="button" className="btn btn-secondary btn-sm" aria-label={`View ${u.name}`} onClick={() => setViewing(u.id)}><Eye size={13} /></button>
          <button type="button" className="btn btn-secondary btn-sm" aria-label={`Edit ${u.name}`} onClick={() => openForm(u)}><Pencil size={13} /></button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={u.id === me?.id} title={u.id === me?.id ? 'You cannot deactivate your own demo account' : ''} aria-label={`${u.status === 'Active' ? 'Deactivate' : 'Activate'} ${u.name}`} onClick={() => setToggling(u)}><Power size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="User Management" description="Demo users stored in this browser. No real accounts are provisioned." actions={<button type="button" className="btn btn-primary" onClick={() => openForm()}><UserPlus size={16} /> Add demo user</button>} />
      <div className="card">
        <div className="grid gap-3 border-b border-line p-4 md:grid-cols-4">
          <SearchInput value={q} onChange={setQ} placeholder="Search name, email…" label="Search users" />
          <FilterDropdown label="Role" value={role} onChange={setRole} options={ROLE_KEYS.map((r) => ({ value: r, label: ROLES[r].label }))} />
          <FilterDropdown label="Status" value={status} onChange={setStatus} options={['Active', 'Inactive']} />
          <button type="button" className="btn btn-ghost" disabled={!(q || role || status)} onClick={clear}><FilterX size={14} /> Clear filters</button>
        </div>
        <DataTable columns={columns} rows={rows} caption="Demo users" initialSort={{ key: 'name', dir: 'asc' }} empty={<EmptyState icon={Users} title="No users match" action={<button type="button" className="btn btn-secondary btn-sm" onClick={clear}>Clear filters</button>} />} />
      </div>

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add demo user' : 'Edit demo user'} description="Demo record only. It does not create a login."
        footer={<><button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button><button type="button" className="btn btn-primary" onClick={submit}>{editing === 'new' ? 'Add user' : 'Save changes'}</button></>}>
        <form onSubmit={submit} noValidate className="space-y-4">
          <TextField label="Name" required error={form.formState.errors.name?.message} {...form.register('name')} />
          <TextField label="Email" type="email" required error={form.formState.errors.email?.message} {...form.register('email')} />
          <SelectField label="Role" required options={ROLE_KEYS.map((r) => ({ value: r, label: ROLES[r].label }))} error={form.formState.errors.role?.message} {...form.register('role')} />
          {watchedRole === 'institute' ? (
            <SelectField label="Associated institute" required options={institutes.map((i) => ({ value: i.id, label: i.name }))} error={form.formState.errors.instituteId?.message} {...form.register('instituteId')} />
          ) : watchedRole ? <TextField label="Organisation" {...form.register('organization')} /> : null}
          <button type="submit" className="sr-only">Submit</button>
        </form>
      </Modal>

      <Drawer open={Boolean(viewed)} onClose={() => setViewing(null)} title={viewed?.name || ''} subtitle={viewed && ROLES[viewed.role].label}>
        {viewed && (
          <dl className="space-y-4 text-sm">
            {[['User ID', viewed.id], ['Email', viewed.email], ['Organisation', viewed.instituteId ? instName(viewed.instituteId) : viewed.organization], ['Designation', viewed.designation], ['Phone', viewed.phone], ['Created', formatDate(viewed.createdAt)]].map(([k, v]) => (
              <div key={k}><dt className="text-xs font-semibold text-muted">{k}</dt><dd className="mt-0.5 text-ink">{v || '—'}</dd></div>
            ))}
            <div><dt className="text-xs font-semibold text-muted">Status</dt><dd className="mt-1"><StatusBadge status={viewed.status} /></dd></div>
          </dl>
        )}
      </Drawer>

      <ConfirmationDialog open={Boolean(toggling)} onCancel={() => setToggling(null)} tone={toggling?.status === 'Active' ? 'danger' : 'primary'}
        title={toggling?.status === 'Active' ? 'Deactivate demo user?' : 'Activate demo user?'} description={toggling ? `${toggling.name} will be marked ${toggling.status === 'Active' ? 'Inactive' : 'Active'}. This only changes the local demo record.` : ''}
        confirmLabel={toggling?.status === 'Active' ? 'Deactivate' : 'Activate'}
        onConfirm={() => { actions.toggleUserStatus(toggling.id); toast.success('Demo user updated', toggling.name); setToggling(null); }} />
    </>
  );
}
